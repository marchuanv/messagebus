import http from 'node:http';
import https from 'node:https';
import { WebSocket, WebSocketServer } from 'ws'; //https://www.npmjs.com/package/ws
import { Address } from './address.mjs';
import { Container } from './container.mjs';
export class MessageBus {
    /**
     * @param { http.Server | https.Server } httpServer
     * @param { Address } address
     */
    constructor(httpServer, address) {
        if (new.target !== MessageBus) {
            throw new TypeError(`${MessageBus.name} can't be extended.`);
        }
        if (!httpServer.listening) {
            httpServer.listen(address.hostPort, () => console.log(`web socket server is running on ${address.hostPort}`));

        }
        const client = new WebSocket(`wss://${address.hostName}:${address.hostPort}`, { rejectUnauthorized: false });
        const server = new WebSocketServer({ server: httpServer });
        Container.setReference(this, client);
        Container.setReference(this, server);
        client.on('close', console.log);
        client.on('error', console.error);
        client.on('open', () => console.log('websocket client connected'));
    }
    /**
     * @template T
     * @returns { Promise<T> }
    */
    receive() {
        return new Promise((resolve) => {
            const server = Container.getReference(this, WebSocketServer.prototype);
            server.off('connection', (connection) => {
                connection.off('error', console.error);
                connection.off('message', (data) => {
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
        return new Promise((resolve) => {
            setTimeout(() => {
                const client = Container.getReference(this, WebSocket.prototype);
                const serialisedObj = Container.serialise(obj);
                client.send(serialisedObj);
                resolve();
            }, 1000);
        });
    }
}