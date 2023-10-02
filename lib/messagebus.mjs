import { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageBusStatus, MessageBusStatus } from './messagebus-status.mjs';
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
        return new Promise((resolve, reject) => {
            const server = Container.getReference(this, WebSocketServer.prototype);
            server.once('connection', (connection) => {
                Container.setReference(this, MessageBusStatus.Open);
                connection.once('error', (error) => {
                    console.error(error);
                    reject(error);
                });
                connection.once('message', (data) => {
                    const status = Container.getReference(this, MessageBusStatus.prototype);
                    const channel = Container.getReference(this, Channel.prototype);
                    if (status === MessageBusStatus.Open && channel.isOpen) {
                        const deserialisedObj = Container.deserialise(data, T);
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
            setTimeout(() => {
                try {
                    const status = Container.getReference(this, MessageBusStatus.prototype);
                    const channel = Container.getReference(this, Channel.prototype);
                    if (status === MessageBusStatus.Open && channel.isOpen) {
                        const client = Container.getReference(this, WebSocket.prototype);
                        const serialisedObj = Container.serialise(obj);
                        client.send(serialisedObj);
                        resolve();
                    } else {
                        reject();
                    }
                } catch(error) {
                    reject(error);
                }
            }, 1000);
        });
    }
    start() {
        const server = Container.getReference(this, WebSocketServer.prototype);
        server.start();
        Container.setReference(this, MessageBusStatus.Open);
    }
    stop() {
        const server = Container.getReference(this, WebSocketServer.prototype);
        server.stop();
        Container.setReference(this, MessageBusStatus.Closed);
    }
}