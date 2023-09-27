import { writeFileSync } from 'node:fs';
import { Server } from 'node:https';
import path from 'node:path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Properties } from '../lib/properties.mjs';
import { Channel } from './channel.mjs';
import { Message } from './message.mjs';
import { Serialisable } from './serialisable.mjs';
const __dirname = dirname(fileURLToPath(import.meta.url));

const properties = new Properties();
const globalContext = {};
export class Communication {
    /**
     * @param { Channel } channel
     */
    constructor(channel) {
        properties.set(this, Channel.prototype, 'channel', channel);
        properties.set(this, Function.prototype, 'receive', this.receive);
        const clientConnection = new WebSocket(`wss://${channel.address.hostName}:${channel.address.hostPort}`, { rejectUnauthorized: false });
        properties.set(this, WebSocket.prototype, 'clientConnection', clientConnection);
        clientConnection.on('close', console.log);
        clientConnection.on('error', console.error);
        clientConnection.on('open', () => {
            console.log('websocket client connected');
        });
        const webSocketServer = new WebSocketServer({ server: Communication.httpServer });
        webSocketServer.on('connection', (connection) => {
            connection.on('error', console.error);
            connection.on('message', async (data) => {
                const deserialisedMessage = Serialisable.deserialise(data.toString());
                const receive = properties.get(this, Function.prototype, 'receive');
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
                const clientConnection = properties.get(this, WebSocket.prototype, 'clientConnection');
                const serialisedObj = message.serialise();
                writeFileSync(path.join(__dirname, '../serialisation.json'), serialisedObj)
                clientConnection.send(serialisedObj);
                // resolve();
            }, 1000)
        });
    }
    static set httpServer(value) {
        properties.set(globalContext, Server.prototype, 'httpServer', value);
    }
    static get httpServer() {
        return properties.get(globalContext, Server.prototype, 'httpServer');
    }
}
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}