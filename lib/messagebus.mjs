import { Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
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
        client.on('close', console.log);
        client.on('error', console.error);
        client.on('open', () => console.log('websocket client connected'));
    }
    /**
     * @template T
     * @returns { Promise<T> }
    */
    receive() {
        startHttpServer.call(this);
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
        startHttpServer.call(this);
        return new Promise((resolve) => {
            setTimeout(() => {
                const client = Container.getReference(this, WebSocket.prototype);
                const serialisedObj = Container.serialise(obj);
                client.send(serialisedObj);
                resolve();
            }, 1000);
        });
    }
    stop() {
        stopHttpServer.call(this);
    }
}
function startHttpServer() {
    const channel = Container.getReference(this, Channel.prototype);
    const httpServer = Container.getReference(this, http.Server.prototype);
    if (!httpServer.listening && channel.isOpen) {
        httpServer.listen(channel.address.hostPort, () => console.log(`web socket server is running on ${channel.source.hostPort}`));
    }
}
function stopHttpServer() {
    const httpServer = Container.getReference(this, http.Server.prototype);
    if (httpServer.listening) {
        httpServer.close();
    }
}