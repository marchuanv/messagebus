import { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageBusClientStatus, MessageBusServerStatus } from './messagebus-status.mjs';
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
            Container.setReference(this, MessageBusClientStatus.Closed);
        });
        client.on('error', console.error);
        client.on('open', () => {
            Container.setReference(this, MessageBusClientStatus.Open);
            console.log('websocket client connected')
        });
        server.on('close', () => {
            Container.setReference(this, MessageBusServerStatus.Closed);
        });
    }
    /**
     * @template T
     * @param { T } type 
     * @returns { Promise<T> }
    */
    receive(type) {
        return new Promise((resolve) => {
            const server = Container.getReference(this, WebSocketServer.prototype);
            server.once('connection', (connection) => {
                connection.once('error', console.error);
                connection.once('message', (data) => {
                    const deserialisedObj = Container.deserialise(data, T);
                    resolve(deserialisedObj);
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
            setTimeout(() => {
                try {
                    const client = Container.getReference(this, WebSocket.prototype);
                    const serialisedObj = Container.serialise(obj);
                    client.send(serialisedObj);
                } catch {
                    reject();
                } finally {
                    resolve();
                }
            }, 1000);
        });
    }
    start() {
        const client = Container.getReference(this, WebSocket.prototype);
        const server = Container.getReference(this, WebSocketServer.prototype);
        Container.setReference(this, MessageBusClientStatus.Open);
        Container.setReference(this, MessageBusServerStatus.Open);
    }
    stop() {
        const client = Container.getReference(this, WebSocket.prototype);
        const server = Container.getReference(this, WebSocketServer.prototype);
        Container.setReference(this, MessageBusClientStatus.Closed);
        Container.setReference(this, MessageBusServerStatus.Closed);
    }
}