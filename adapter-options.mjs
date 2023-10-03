import crypto from 'node:crypto';
import { Server } from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./lib/container.mjs";
export class AdapterOptions extends Container {
    /**
     * @param { Server } value
     */
    async setServer(value) {
        await Container.setReference(this, value);
    }
    /**
     * @returns { Server }
     */
    async getServer() {
        return await Container.getReference(this, Server.prototype);
    }
    /**
     * @returns { AdapterOptions }
     */
    static get Default() {
        return defaultServerOptions;
    }
}
export class DefaultServerOptions extends AdapterOptions {
    constructor() {
        super();
        const credentials = { key: null, cert: null, passphrase: crypto.randomUUID() };
        pem.createCertificate({ days: 365, selfSigned: true }, async (err, keys) => {
            if (err) {
                throw err
            }
            credentials.key = keys.clientKey;
            credentials.cert = keys.certificate;
            await super.setServer(https.createServer(credentials));
        });
    }
}
const defaultServerOptions = new DefaultServerOptions();