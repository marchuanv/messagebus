
import { Adapter } from '../adapter.mjs';
import { HttpConnectionPool } from '../http-connection-pool.mjs';
import { Messaging } from '../lib/messaging.mjs';

export class ClientAppleMessaging extends Messaging {
    constructor() {
        super('apples', 'localhost', 3000, 'localhost', 4000);
    }
    async handle(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Apple Publisher' }));
        await this.broadcast({ message: 'Hello From Apple Subscriber' });
    }
}
export class ServerAppleMessaging extends Messaging {
    constructor() {
        super('apples', 'localhost', 4000, 'localhost', 3000);
    }
    async handle(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Apple Publisher' }));
        await this.broadcast({ message: 'Hello From Apple Subscriber' });
    }
}

const httpConnectionPool = new HttpConnectionPool();

const clientAppleMessaging = new ClientAppleMessaging();
const serverAppleMessaging = new ServerAppleMessaging();

const clientApplesAdapter = new Adapter(clientAppleMessaging, httpConnectionPool);
const serverApplesAdapter = new Adapter(serverAppleMessaging, httpConnectionPool);

fdescribe('when sending a message on the apple channel', () => {
    it('should notify all apple subscribers', async (done) => {
        await clientApplesAdapter.connect();
        await serverApplesAdapter.connect();
        await clientAppleMessaging.broadcast({ message: 'Hello From Apple Publisher' });
    });
});
