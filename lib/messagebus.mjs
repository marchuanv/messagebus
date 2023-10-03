import { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageBusStatus } from './messagebus-status.mjs';
export class MessageBus {
    /**
     * @param { Server } httpServer
     * @param { Channel } channel
     */
    constructor(httpServer, channel) {
        if (new.target !== MessageBus) {
            throw new TypeError(`${MessageBus.name} can't be extended.`);
        }
        const client = new WebSocket(`wss://${channel.destination.hostName}:${channel.destination.hostPort}`, { rejectUnauthorized: false });
        const server = new WebSocketServer({ server: httpServer });
        Container.setReference(this, client);
        Container.setReference(this, server);
        Container.setReference(this, httpServer);
        Container.setReference(this, channel);
        client.on('close', () => {
            Container.setReference(this, MessageBusStatus.Closed);
        });
        client.on('error', console.error);
        client.on('open', () => {
            Container.setReference(this, MessageBusStatus.Open);
            console.log('websocket client connected')
        });
        server.on('close', () => {
            Container.setReference(this, MessageBusStatus.Closed);
        });
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
                await Container.setReference(this, MessageBusStatus.Open);
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
        Container.setReference(this, MessageBusStatus.Open);
    }
    async stop() {
        const server = await Container.getReference(this, WebSocketServer.prototype);
        await server.stop();
        await Container.setReference(this, MessageBusStatus.Closed);
    }
}