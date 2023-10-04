import { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageBusStatus } from './messagebus-status.mjs';
export class MessageBus extends Container {
    /**
     * @param { Server } httpServer
     * @param { Channel } channel
     */
    constructor(httpServer, channel) {
        if (new.target !== MessageBus) {
            throw new TypeError(`${MessageBus.name} can't be extended.`);
        }
        super();
        (async () => {
            const destinationAddress = await channel.getDestination();
            const destinationAddressHostName = await destinationAddress.getHostName();
            const destinationAddressHostPort = await destinationAddress.getHostPort();

            const client = new WebSocket(`wss://${destinationAddressHostName}:${destinationAddressHostPort}`, { rejectUnauthorized: false });
            const server = new WebSocketServer({ server: httpServer });
            Container.setReference(this, client, WebSocket.prototype);
            Container.setReference(this, server, WebSocketServer.prototype);
            Container.setReference(this, httpServer, Server.prototype);
            Container.setReference(this, channel, Channel.prototype);
            client.on('close', () => {
                Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
            });
            client.on('error', console.error);
            client.on('open', () => {
                Container.setReference(this, MessageBusStatus.Open, MessageBusStatus.prototype);
                console.log('websocket client connected')
            });
            server.on('close', () => {
                Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
            });
        })();
    }
    /**
     * @template T
     * @param { T } type
     * @returns { Promise<T> }
    */
    receive(type) {
        return new Promise(async (resolve, reject) => {
            const server = await Container.getReference(this, WebSocketServer.prototype);
            server.once('connection', async (connection) => {
                await Container.setReference(this, MessageBusStatus.Open, MessageBusStatus.prototype);
                connection.once('error', (error) => {
                    console.error(error);
                    reject(error);
                });
                connection.once('message', async (data) => {
                    const status = await Container.getReference(this, MessageBusStatus.prototype);
                    const channel = await Container.getReference(this, Channel.prototype);
                    if (status === MessageBusStatus.Open && (await channel.isOpen())) {
                        const deserialisedObj = await Container.deserialise(data, T);
                        resolve(deserialisedObj);
                    } else {
                        reject();
                    }
                });
            });
        });
    }
    /**
     * @template T
     * @param { T } obj
     * @returns { Promise<Boolean> }
    */
    send(obj) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const status = await Container.getReference(this, MessageBusStatus.prototype);
                    const channel = await Container.getReference(this, Channel.prototype);
                    if (status === MessageBusStatus.Open && (await channel.isOpen())) {
                        const client = await Container.getReference(this, WebSocket.prototype);
                        const serialisedObj = await Container.serialise(obj);
                        client.send(serialisedObj);
                        resolve();
                    } else {
                        reject();
                    }
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
    }
    async start() {
        const server = await Container.getReference(this, WebSocketServer.prototype);
        await server.start();
        Container.setReference(this, MessageBusStatus.Open, MessageBusStatus.prototype);
    }
    async stop() {
        const server = await Container.getReference(this, WebSocketServer.prototype);
        await server.stop();
        await Container.setReference(this, MessageBusStatus.Closed, MessageBusStatus.prototype);
    }
}