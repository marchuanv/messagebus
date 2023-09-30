import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import pem from 'pem';
import { Container } from "./lib/container.mjs";
export class AdapterOptions extends Container {
    /**
     * @param { https.Server.prototype | http.Server.prototype } value
     */
    set server(value) {
        Container.setReference(this, value);
    }
    /**
     * @returns { https.Server | http.Server }
     */
    get server() {
        return Container.getReference(this, (https.Server.prototype || http.Server.prototype));
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