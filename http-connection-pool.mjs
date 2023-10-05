import crypto from 'node:crypto';
import { Channel } from 'node:diagnostics_channel';
import http, { Server } from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./lib/container.mjs";
import { Task } from './lib/task.mjs';

const credentials = {
    key: null,
    cert: null,
    passphrase: crypto.randomUUID()
};
pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
    if (err) {
        throw err
    }
    credentials.key = keys.clientKey;
    credentials.cert = keys.certificate;
});

export class Connection extends Container {
    /**
     * @param { Server } server
    */
    constructor(server, port, isSecure = true) {
        super();
        super.setReference(server, Server.prototype, 'server');
        super.setProperty({ isSecure }, Boolean.prototype);
        super.setProperty({ port }, Number.prototype);
    }
    async isSecure() {
        return await super.getProperty({ isSecure: null }, Boolean.prototype);
    }
    async getPort() {
        return await super.getProperty({ port: null }, Number.prototype);
    }
    async open() {
        return Task.create(this).run(null, async function (instance) {
            const task = this;
            const server = await instance.getReference(Server.prototype, 'server');
            const port = await instance.getPort();
            server.listen(port, () => {
                console.log(`listening on port ${port}`);
                task.results = true;
            });
        });
    }
    async getServer() {
        return await super.getReference(Server.prototype, 'server');
    }
}

class HttpConnection extends Connection {
    /**
     * @param { Number } port
     */
    constructor(port) {
        const connection = http.createServer();
        super(connection, port, false);
    }
}

class SecureHttpConnection extends Connection {
    /**
     * @param { Number } port
     */
    constructor(port) {
        const connection = https.createServer(credentials);
        super(connection, port, true);
    }
}

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
        return Task.create(this).run(Connection.prototype, async function (instance) {
            const sourceAddress = await channel.getSource();
            const port = await sourceAddress.getHostPort();
            const isSecure = await channel.isSecure();
            const connections = await instance.getReference(Server.prototype, 'connections');
            for (const con of connections) {
                if ((await findConnection(con, port, isSecure))) {
                    return con;
                }
            };
            if (isSecure) {
                const newConnection = new SecureHttpConnection(port);
                connections.push(newConnection);
                await newConnection.open();
                return newConnection;
            } else {
                const newConnection = new HttpConnection(port);
                connections.push(newConnection);
                await newConnection.open();
                return newConnection;
            }
        });
    }
}
async function findConnection(con, port, isSecure) {
    const _port = await con.getPort();
    const _isSecure = await con.isSecure();
    return (_port === port && _isSecure === isSecure);
}