import Jasmine from 'jasmine';
import https from 'node:https';
import pem from 'pem';
import * as url from 'url';
import { Communication } from '../lib/communication.mjs';
const credentials = {
    key: null,
    cert: null,
    passphrase: 'test1234'
};
pem.createCertificate({ days: 365, selfSigned: true }, async (err, keys) => {
    if (err) {
        throw err
    }
    credentials.key = keys.clientKey;
    credentials.cert = keys.certificate;
    Communication.httpServer = https.createServer(credentials).listen(3000, () => {
        console.log(`http server is running on port 3000`);
    });
    const __dirname = url.fileURLToPath(new URL('./', import.meta.url));
    const jasmine = new Jasmine({ projectBaseDir: __dirname });
    jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
    jasmine.execute();
});
