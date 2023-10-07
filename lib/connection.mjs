import crypto from 'node:crypto';
import http, { Server } from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./container.mjs";
import { Priority } from './priority.mjs';
import { Task } from './task.mjs';
import { TaskFlag } from './task-flag.mjs';

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
        return Task.create('open', this, null, [
            TaskFlag.HandleErrors , TaskFlag.MediumPriority , TaskFlag.WaitForValidResponse , TaskFlag.OnceOff
        ]).queue(null, async function (instance) {
            const server = await instance.getReference(Server.prototype, 'server');
            const port = await instance.getPort();
            server.listen(port, () => {
                console.log(`listening on port ${port}`);
                this.complete(true);
            });
        });
    }
    async getServer() {
        return await super.getReference(Server.prototype, 'server');
    }
}

export class HttpConnection extends Connection {
    /**
     * @param { Number } port
     */
    constructor(port) {
        const connection = http.createServer();
        super(connection, port, false);
    }
}

export class SecureHttpConnection extends Connection {
    /**
     * @param { Number } port
     */
    constructor(port) {
        const connection = https.createServer(credentials);
        super(connection, port, true);
    }
}