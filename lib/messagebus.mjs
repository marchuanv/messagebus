import { Server } from 'node:https';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { MessageSubscription } from '../subscription.mjs';
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { Envelope } from './envelope.mjs';
export class MessageBus {
    /**
     * @param { Server } httpServer
     * @param { Channel } channel
     */
    constructor(httpServer, channel) {
        if (new.target !== MessageBus) {
            throw new TypeError(`${MessageBus.name} can't be extended.`);
        }
        Container.setReference(this, channel);
        const client = new WebSocket(`wss://${channel.address.hostName}:${channel.address.hostPort}`, { rejectUnauthorized: false });
        const server = new WebSocketServer({ server: httpServer });
        Container.setReference(this, client);
        Container.setReference(this, server);
        client.on('close', console.log);
        client.on('error', console.error);
        client.on('open', () => {
            console.log('websocket client connected');
        });
    }
    /**
     * @param { MessageSubscription } messageSubscription
    */
    receive() {
        return new Promise((resolve) => {
            const server = Container.getReference(this, WebSocketServer.prototype);
            server.off('connection', (connection) => {
                connection.off('error', console.error);
                connection.off('message', (data) => {
                    const deserialisedEnvelope = Container.deserialise(data, Envelope.prototype);
                    resolve(deserialisedEnvelope);
                });
            });
        });
    }
    /**
     * @param { Envelope } envelope
    */
    send(envelope) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const client = Container.getReference(this, WebSocket.prototype);
                const serialisedEnvelope = Container.serialise(envelope);
                client.send(serialisedEnvelope);
                resolve();
            }, 1000);
        });
    }
    /**
    * @returns { Channel }
    */
    get channel() {
        return Container.getReference(this, Channel.prototype);
    }
}