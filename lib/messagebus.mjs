import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Connection } from './connection.mjs';
import { Container } from './container.mjs';
import { Message } from './message.mjs';
import { MessageBusStatus } from './messagebus-status.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
import { TaskFlag } from './task-flag.mjs';
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
        Task.create('clientconnect', this, channel, [
            TaskFlag.HandleErrors, TaskFlag.MediumPriority, TaskFlag.RepeatUntilValidResponse
        ]).queue(null, async function (instance, _channel) {
            const destinationAddress = await _channel.getDestination();
            const destinationAddressHostName = await destinationAddress.getHostName();
            const destinationAddressHostPort = await destinationAddress.getHostPort();
            let client = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
            client.once('close', () => {
                console.log(`${instance.Id}: web socket client retrying on port: ${destinationAddressHostPort}`);
            });
            client.once('error', console.error);
            client.once('open', () => {
                client.removeAllListeners('close');
                client.removeAllListeners('error');
                client.removeAllListeners('open');
                instance.setReference(MessageBusStatus.Ready, MessageBusStatus.prototype);
                this.complete(true);
                client.close(0);
            });
        });
        Task.create('clientready', this, channel, [
            TaskFlag.HandleErrors, TaskFlag.LowPriority, TaskFlag.RepeatUntilValidResponse
        ]).queue(null, async function (_instance, _channel) {
            const status = await _instance.getReference(MessageBusStatus.prototype);
            if (status === MessageBusStatus.Ready) {
                const destinationAddress = await _channel.getDestination();
                const destinationAddressHostName = await destinationAddress.getHostName();
                const destinationAddressHostPort = await destinationAddress.getHostPort();
                let _newClient = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
                //clientconnect makes sure that it can connect to the server the first time
                _instance.setReference(MessageBusStatus.ClientOpen, MessageBusStatus.prototype);
                _instance.setReference(_newClient, WebSocket.prototype, 'webSocket');
                _newClient.on('close', () => {
                    _instance.setReference(MessageBusStatus.ClientClosed, MessageBusStatus.prototype);
                    console.log(`${_instance.Id}: Websocket Client closed on port: ${destinationAddressHostPort}`);
                });
                _newClient.on('error', console.error);
                _newClient.on('open', () => {
                    console.log(`${_instance.Id}: Websocket Client opened on port: ${destinationAddressHostPort}`);
                    this.complete(true);
                });
            }
        });
        Task.create('serverconnect', this, connection, [
            TaskFlag.HandleErrors, TaskFlag.HighPriority, TaskFlag.OnceOff, TaskFlag.ValidResponse
        ]).queue(null, async function (instance, _connection) {
            const httpServer = await _connection.getServer();
            const hostPort = await _connection.getPort();
            const server = new WebSocketServer({ server: httpServer });
            instance.setReference(server, WebSocketServer.prototype, 'webSocketServer');
            server.on('connection', async (con) => {
                const status = await instance.getReference(MessageBusStatus.prototype);
                if (status === MessageBusStatus.ClientOpen) {
                    instance.setReference(con, WebSocket.prototype, 'webSocketServerConnection');
                    console.log(`${instance.Id}: Websocket Server received a connection on port: ${hostPort}`);
                    instance.setReference(MessageBusStatus.ServerOpen, MessageBusStatus.prototype);
                }
            });
            server.on('close', () => {
                instance.setReference(MessageBusStatus.ServerClosed, MessageBusStatus.prototype);
                console.log(`${instance.Id}: Websocket Server connection was closed on port: ${hostPort}`);
            });
            this.complete(true);
        });
    }
    /**
     * @returns { Message }
    */
    receive() {
        return Task.create('receive', this, [
            TaskFlag.HandleErrors, TaskFlag.LowPriority, TaskFlag.RepeatUntilValidResponse
        ]).queue(Message.prototype, async function (instance) {
            const status = await instance.getReference(MessageBusStatus.prototype);
            const channel = await instance.getReference(Channel.prototype);
            const isOpen = await channel.isOpen();
            if (isOpen) {
                if (status === MessageBusStatus.ServerOpen) {
                    const webSocketServerConnection = await instance.getReference(WebSocket.prototype, 'webSocketServerConnection');
                    webSocketServerConnection.on('error', (error) => {
                        throw error;
                    });
                    webSocketServerConnection.on('message', async (data) => {
                        const dataStr = data.toString();
                        const status = await instance.getReference(MessageBusStatus.prototype);
                        const channel = await instance.getReference(Channel.prototype);
                        const isOpen = await channel.isOpen();
                        if (isOpen) {
                            if (status === MessageBusStatus.ServerOpen) {
                                const serialised = JSON.parse(dataStr);
                                const messageType = MessageType.All.find(msgType => msgType.constructor.name === serialised[5].messageType);
                                const priority = Priority.All.find(prior => prior.constructor.name === serialised[4].priority);
                                const source = new Address(serialised[3].hostName, serialised[3].hostPort);
                                const destination = new Address(serialised[2].hostName, serialised[2].hostPort);
                                const channel = new Channel(serialised[1].name, source, destination);
                                const message = new Message(channel, priority, messageType);
                                message.setData(serialised[0]);
                                this.complete(message);
                            }
                        } else {
                            throw new Error('channel is closed');
                        }
                    });
                }
            } else if (status === MessageBusStatus.ServerClosed) {
                throw new Error('message bus server is closed');
            } else {
                throw new Error('channel is closed');
            }
        });
    }
    /**
     * @param { Message } message
    */
    send(message) {
        return Task.create('send', this, message, [
            TaskFlag.HandleErrors, TaskFlag.LowPriority, TaskFlag.RepeatUntilValidResponse
        ]).queue(null, async function (instance, _message) {
            const status = await instance.getReference(MessageBusStatus.prototype);
            const channel = await instance.getReference(Channel.prototype);
            const isOpen = await channel.isOpen();
            if (isOpen) {
                if (status === MessageBusStatus.ClientOpen) {
                    const client = await instance.getReference(WebSocket.prototype, 'webSocket');
                    let serialised = [];

                    const serialisedData = await _message.getData();
                    serialised.push(serialisedData);

                    const channel = await _message.getChannel();
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

                    const priority = await _message.getPriority();
                    serialised.push({ priority: priority.constructor.name });

                    const messageType = await _message.getType();
                    serialised.push({ messageType: messageType.constructor.name });

                    serialised = JSON.stringify(serialised);

                    await client.send(serialised);
                    return this.complete(true);
                } else if (status === MessageBusStatus.ClientClosed) {
                    return this.complete(false);
                }
            } else {
                return this.complete(false);
            }
        });
    }
    /**
     * @returns { Boolean }
    */
    isStarted() {
        return Task.create('isstarted', this, null, [
            TaskFlag.HandleErrors, TaskFlag.LowPriority, TaskFlag.OnceOff, TaskFlag.ValidResponse
        ]).queue(Boolean.prototype, async function (instance) {
            const status = await instance.getReference(MessageBusStatus.prototype);
            if (status === MessageBusStatus.ClientOpen && status === MessageBusStatus.ServerOpen) {
                return this.complete(true);
            }
            return this.complete(false);
        });
    }
}