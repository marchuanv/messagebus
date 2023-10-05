import crypto from 'node:crypto';
import { Channel } from 'node:diagnostics_channel';
import http, { Server } from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./lib/container.mjs";

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
        Container.setReference(this, server, Server.prototype, 'server');
        Container.setProperty(this, { isSecure }, Boolean.prototype);
        Container.setProperty(this, { port }, Number.prototype);
    }
    async isSecure() {
        return await Container.getProperty(this, { isSecure: null }, Boolean.prototype);
    }
    async getPort() {
        return await Container.getProperty(this, { port: null }, Number.prototype);
    }
    async open() {
        return this.promise(async (resolve) => {
            const server = await Container.getReference(this, Server.prototype, 'server');
            const port = await this.getPort();
            server.listen(port, () => {
                console.log(`listening on port ${port}`);
                resolve();
            });
        });
    }
    async getServer() {
        return await Container.getReference(this, Server.prototype, 'server');
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
            Container.setReference(this, [existingConnection], Connection.prototype, 'connections');
        } else {
            Container.setReference(this, [], Connection.prototype, 'connections');
        }
    }
    /**
     * @param { Channel } channel
     * @returns { Connection }
     */
    async connect(channel) {
        const sourceAddress = await channel.getSource();
        const port = await sourceAddress.getHostPort();
        const isSecure = await channel.isSecure();

        const connections = await Container.getReference(this, Server.prototype, 'connections');
        let connection = null;
        for (const con of connections) {
            if ((await findConnection(con, port, isSecure))) {
                connection = con;
                break;
            }
        };
        if (connection) {
            return connection;
        } else {
            if (isSecure) {
                const newConnection = new SecureHttpConnection(port);
                await newConnection.open();
                connections.push(newConnection);
                return newConnection;
            } else {
                const newConnection = new HttpConnection(port);
                await newConnection.open();
                connections.push(newConnection);
                return newConnection;
            }
        }
    }
}
async function findConnection(con, port, isSecure) {
    const _port = await con.getPort();
    const _isSecure = await con.isSecure();
    return (_port === port && _isSecure === isSecure);
}