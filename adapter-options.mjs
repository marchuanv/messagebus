import crypto from 'node:crypto';
import { Server } from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./lib/container.mjs";
export class AdapterOptions extends Container {
    /**
     * @param { Server } value
     */
    set server(value) {
        Container.setReference(this, value);
    }
    /**
     * @returns { Server }
     */
    get server() {
        return Container.getReference(this, Server.prototype);
    }
    /**
     * @returns { AdapterOptions }
     */
    static get Default() {
        return defaultServerOptions;
    }
}
class DefaultServerOptions extends AdapterOptions {
    constructor() {
        const credentials = { key: null, cert: null, passphrase: crypto.randomUUID() };
        pem.createCertificate({ days: 365, selfSigned: true }, async (err, keys) => {
            if (err) {
                throw err
            }
            credentials.key = keys.clientKey;
            credentials.cert = keys.certificate;
            super.server = https.createServer(credentials);
        });
    }
}
const defaultServerOptions = new DefaultServerOptions();