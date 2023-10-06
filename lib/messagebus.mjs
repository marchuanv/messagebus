import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Connection } from '../http-connection-pool.mjs';
import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { Message } from './message.mjs';
import { MessageBusStatus } from './messagebus-status.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
import { Task } from './task.mjs';
export class MessageBus extends Container {
    /**
     * @param { Connection } connection
     * @param { Channel } channel
     */
    constructor(connection, channel) {
        if (new.target !== MessageBus) {
            throw new TypeError(`${MessageBus.name} can't be extended.`);
        }
        super();
        console.log(`${this.Id}: message bus created`);
        super.setReference(channel, Channel.prototype);
        super.setReference(MessageBusStatus.Unkown, MessageBusStatus.prototype);
        Task.create('websocketclient', this, { priority: Priority.High }).run(null, async function (instance) {
            const task = this;
            const destinationAddress = await channel.getDestination();
            const destinationAddressHostName = await destinationAddress.getHostName();
            const destinationAddressHostPort = await destinationAddress.getHostPort();
            let client = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
            client.once('close', () => {
                console.log(`${instance.Id}: web socket client retrying on port: ${destinationAddressHostPort}`);
            });
            client.once('error', console.error);
            client.once('open', () => {
                client = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
                client.on('close', () => {
                    instance.setReference(MessageBusStatus.Closed, MessageBusStatus.prototype);
                    console.log(`${instance.Id}: Websocket Client closed on port: ${destinationAddressHostPort}`);
                });
                client.on('error', console.error);
                client.on('open', () => {
                    instance.setReference(MessageBusStatus.Open, MessageBusStatus.prototype);
                    instance.setReference(client, WebSocket.prototype, 'webSocket');
                    console.log(`${instance.Id}: Websocket Client opened on port: ${destinationAddressHostPort}`);
                    task.results = true;
                });
            });
        });
        Task.create('websocketserver', this, { priority: Priority.High }).run(null, async function (instance) {
            const httpServer = await connection.getServer();
            const server = new WebSocketServer({ server: httpServer });
            instance.setReference(server, WebSocketServer.prototype, 'webSocketServerConnection');
            server.on('connection', async (con) => {
                instance.setReference(con, WebSocket.prototype, 'webSocketServerConnection');
                const hostPort = await connection.getPort();
                console.log(`${instance.Id}: Websocket Server received a connection on port: ${hostPort}`);
            });
            server.on('close', () => {
                instance.setReference(MessageBusStatus.Closed, MessageBusStatus.prototype);
                console.log(`${instance.Id}: Websocket Server connection was closed on port: ${hostPort}`);
            });
            instance.setReference(server, WebSocketServer.prototype, 'webSocketServer');
            return true;
        });
    }
    /**
     * @returns { Message }
    */
    receive() {
        return Task.create('receive', this).run(Message.prototype, async function (instance) {
            const task = this;
            const webSocketServerConnection = await instance.getReference(WebSocket.prototype, 'webSocketServerConnection');
            webSocketServerConnection.once('error', (error) => {
                task.results = error;
            });
            webSocketServerConnection.once('message', async (data) => {
                const dataStr = data.toString();
                const status = await instance.getReference(MessageBusStatus.prototype);
                const channel = await instance.getReference(Channel.prototype);
                const isOpen = await channel.isOpen();
                if (status === MessageBusStatus.Open && isOpen) {
                    const serialised = JSON.parse(dataStr);
                    const messageType = MessageType.All.find(msgType => msgType.constructor.name === serialised[5].messageType);
                    const priority = Priority.All.find(prior => prior.constructor.name === serialised[4].priority);
                    const source = new Address(serialised[3].hostName, serialised[3].hostPort);
                    const destination = new Address(serialised[2].hostName, serialised[2].hostPort);
                    const channel = new Channel(serialised[1].name, source, destination);
                    const message = new Message(channel, priority, messageType);
                    message.setData(serialised[0]);
                    task.results = message;
                } else {
                    task.results = new Error(`messagebus or channel is closed`);
                }
            });
        });
    }
    /**
     * @param { Message } message
    */
    send(message) {
        return Task.create('send', this).run(null, async function (instance) {
            const status = await instance.getReference(MessageBusStatus.prototype);
            const channel = await instance.getReference(Channel.prototype);
            const isOpen = await channel.isOpen();
            if (status === MessageBusStatus.Open && isOpen) {
                const client = await instance.getReference(WebSocket.prototype, 'webSocket');
                let serialised = [];

                const serialisedData = await message.getData();
                serialised.push(serialisedData);

                const channel = await message.getChannel();
                const name = await channel.getName();
                serialised.push({ name });

                let address = await channel.getSource();
                let hostName = await address.getHostName();
                let hostPort = await address.getHostPort();
                serialised.push({ hostName, hostPort });

                address = await channel.getDestination();
                hostName = await address.getHostName();
                hostPort = await address.getHostPort();
                serialised.push({ hostName, hostPort });

                const priority = await message.getPriority();
                serialised.push({ priority: priority.constructor.name });

                const messageType = await message.getType();
                serialised.push({ messageType: messageType.constructor.name });

                serialised = JSON.stringify(serialised);

                await client.send(serialised);
                return true;
            }
        });
    }
    /**
     * @returns { Boolean }
     */
    isStarted() {
        return Task.create('isstarted', this).run(Boolean.prototype, async function (instance) {
            const status = await instance.getReference(MessageBusStatus.prototype);
            if (status === MessageBusStatus.Open) {
                return true;
            }
        });
    }
}