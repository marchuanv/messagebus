import { Channel } from 'node:diagnostics_channel';
import { Container } from "./lib/container.mjs";
import { Connection, HttpConnection, SecureHttpConnection } from "./lib/connection.mjs";
import { Task } from './lib/task.mjs';
import { Server } from 'node:http';
import { TaskFlag } from './lib/task-flag.mjs';

export class HttpConnectionPool extends Container {
    /**
     * @param { Server } server
     */
    constructor(server) {
        super();
        if (server) {
            const existingConnection = new Connection(server);
            super.setReference([existingConnection], Connection.prototype, 'connections');
        } else {
            super.setReference([], Connection.prototype, 'connections');
        }
    }
    /**
     * @param { Channel } channel
     * @returns { Connection }
     */
    async connect(channel) {
        return Task.create('connect', this, channel, [
            TaskFlag.HandleErrors , TaskFlag.MediumPriority , TaskFlag.OnceOff , TaskFlag.ValidResponse
        ]).queue(Connection.prototype, async function (instance) {
            const sourceAddress = await channel.getSource();
            const port = await sourceAddress.getHostPort();
            const isSecure = await channel.isSecure();
            const connections = await instance.getReference(Server.prototype, 'connections');
            for (const con of connections) {
                if ((await findConnection(con, port, isSecure))) {
                    return this.complete(con);
                }
            };
            let newConnection = null;
            if (isSecure) {
                newConnection = new SecureHttpConnection(port);
            } else {
                newConnection = new HttpConnection(port);
            }
            connections.push(newConnection);
            await newConnection.open();
            this.complete(newConnection);
        });
    }
}
async function findConnection(con, port, isSecure) {
    const _port = await con.getPort();
    const _isSecure = await con.isSecure();
    return (_port === port && _isSecure === isSecure);
}