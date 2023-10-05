import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Connection } from '../http-connection-pool.mjs';
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageBusStatus } from './messagebus-status.mjs';
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
        Container.setReference(this, channel, Channel.prototype);
        this.poll(async () => {
            return await this.promise(async (resolve) => {
                const destinationAddress = await channel.getDestination();
                const destinationAddressHostName = await destinationAddress.getHostName();
                const destinationAddressHostPort = await destinationAddress.getHostPort();
                const client = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
                Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
                client.on('close', () => {
                    console.log(`websocket client closed on port: ${destinationAddressHostPort}`);
                });
                client.on('error', console.error);
                client.on('open', () => {
                    Container.setReference(this, client, WebSocket.prototype, 'webSocket');
                    Container.setReference(this, MessageBusStatus.Open, MessageBusStatus.prototype);
                    console.log(`websocket client opened on port: ${destinationAddressHostPort}`);
                    resolve(true);
                });
            });
        });
        connection.getServer().then((httpServer) => {
            const server = new WebSocketServer({ server: httpServer });
            server.on('connection', (connection) => {
                Container.setReference(this, connection, WebSocket.prototype, 'webSocketServerConnection');
            });
            server.on('close', () => {
                Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
            });
            Container.setReference(this, server, WebSocketServer.prototype, 'webSocketServer');
        });
    }
    /**
     * @template T
     * @param { T } type
     * @returns { Promise<T> }
    */
    receive(type) {
        return this.promise(async (resolve, reject) => {
            const webSocketServerConnection = await Container.getReference(this, WebSocket.prototype, 'webSocketServerConnection');
            webSocketServerConnection.once('error', (error) => {
                console.error(error);
                reject(error);
            });
            webSocketServerConnection.once('message', async (data) => {
                const dataStr = data.toString();
                const status = await Container.getReference(this, MessageBusStatus.prototype);
                const channel = await Container.getReference(this, Channel.prototype);
                const isOpen = await channel.isOpen();
                if (status === MessageBusStatus.Open && isOpen) {
                    const deserialisedObj = await Container.deserialise(dataStr, null);
                    resolve(deserialisedObj);
                } else {
                    reject();
                }
            });
        });
    }
    /**
     * @template T
     * @param { T } obj
     * @returns { Promise<Boolean> }
    */
    send(obj) {
        return this.promise(async (resolve) => {
            this.poll(async () => {
                try {
                    const status = await Container.getReference(this, MessageBusStatus.prototype);
                    const channel = await Container.getReference(this, Channel.prototype);
                    const isOpen = await channel.isOpen();
                    if (status === MessageBusStatus.Open && isOpen) {
                        const client = await Container.getReference(this, WebSocket.prototype, 'webSocket');
                        const serialisedObj = await Container.serialise(obj);
                        await client.send(serialisedObj);
                        resolve(true);
                        return true;
                    }
                } catch (error) {
                    console.error(error);
                }
            });
        });
    }
    isStarted() {
        return this.promise(async (resolve) => {
            this.poll(async () => {
                const status = await Container.getReference(this, MessageBusStatus.prototype);
                if (status === undefined) {
                    return false;
                }
                if (status === MessageBusStatus.Open) {
                    resolve(true);
                    return true;
                }
                if (status === MessageBusStatus.Closed) {
                    resolve(false);
                    return true;
                }
            });
        });
    }
    async start() {
        const server = await Container.getReference(this, WebSocketServer.prototype, 'webSocketServer');
        // await server.start();
        // Container.setReference(this, MessageBusStatus.Open, MessageBusStatus.prototype);
    }
    async stop() {
        // const server = await Container.getReference(this, WebSocketServer.prototype, 'webSocketServer');
        // await server.stop();
        // await Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
    }
}