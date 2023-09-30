import { https } from 'node:https';
import pem from 'pem';
import { Priority } from '../lib/priority.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
describe('given an https connection', () => {
    let httpServer;
    beforeAll(() => {
        const credentials = { key: null, cert: null, passphrase: 'test1234' };
        pem.createCertificate({ days: 365, selfSigned: true }, async (err, keys) => {
            if (err) {
                throw err
            }
            credentials.key = keys.clientKey;
            credentials.cert = keys.certificate;
            httpServer = https.createServer(credentials);
            httpServer.listen(3000, () => {
                console.log(`http server is running on port 3000`);
            });
        });
    });
    describe('when sending an apple message on the fruit channel', () => {
        it('should notify all apple subscribers', async () => {
            const adapter = new MessageBusAdapter('Apple', 'localhost', 3000);
            const expectedMsg = await adapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
            expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        });
    });
    describe('when sending a tomato message on the fruit channel', () => {
        it('should notify all tomato subscribers', async () => {
            const adapter = new MessageBusAdapter('Tomato', 'localhost', 3000);
            const expectedMsg = await adapter.send(Priority.Medium, { message: 'Hello From Tomato Publisher' });
            expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato Subscriber' }));
        });
    });
    describe('when sending a tomato message on the fruit channel', () => {
        it('should notify all tomato subscribers', async () => {
            const adapter = new MessageBusAdapter('Apple', 'localhost', 3000);
            let expectedMsg = await adapter.send(Priority.Medium, { message: 'Hello From Apple Publisher' });
            expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
            expectedMsg = await adapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
            expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        });
    });
    afterAllAll(() => {
        httpServer.close();
    });
});
