import { Server } from 'node:https';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { Message } from './message.mjs';
import { Serialisable } from './serialisable.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));
export class Communication extends Container {
    /**
     * @param { Server } httpServer
     * @param { Channel } channel
     */
    constructor(httpServer, channel) {
        const clientConnection = new WebSocket(`wss://${channel.address.hostName}:${channel.address.hostPort}`, { rejectUnauthorized: false });
        const serverConnection = new WebSocketServer({ server: httpServer });
        super();

        Container.setReference(this, this.receive);
        Container.setReference(this, clientConnection);
        Container.setReference(this, channel);
        Container.setReference(this, serverConnection);

        clientConnection.on('close', console.log);
        clientConnection.on('error', console.error);
        clientConnection.on('open', () => {
            console.log('websocket client connected');
        });
        serverConnection.on('connection', (connection) => {
            connection.on('error', console.error);
            connection.on('message', async (data) => {
                const deserialisedMessage = Serialisable.deserialise(data.toString());
                await receive(deserialisedMessage);
            });
        });
    }
    /**
     * @param { Message } message
     */
    send(message) {
        return new Promise(async (resolve) => {
            setTimeout(() => {
                const clientConnection = Container.getReference(this, WebSocket.prototype);
                const serialisedObj = message.serialise();
                clientConnection.send(serialisedObj);
                resolve();
            }, 1000)
        });
    }
}