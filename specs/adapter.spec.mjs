
import { Adapter } from '../adapter.mjs';
import { Messaging } from '../lib/messaging.mjs';

class AppleMessaging extends Messaging {
    constructor() {
        super('apples', 'localhost', 3000, 'localhost', 3000);
    }
    async handle(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Apple Publisher' }));
        await this.broadcast({ message: 'Hello From Apple Subscriber' });
    }
}
class TomatoMessaging extends Messaging {
    constructor() {
        super('tomato', 'localhost', 3000, 'localhost', 3000);
    }
    async handle(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Tomato Publisher' }));
        await this.broadcast({ message: 'Hello From Tomato Subscriber' });
    }
}

const appleMessaging = new AppleMessaging();
const tomatoMessaging = new TomatoMessaging();

const tomatoAdapter = new Adapter(appleMessaging);
const applesAdapter = new Adapter(tomatoMessaging);

fdescribe('when sending a message on the apple channel', () => {
    it('should notify all apple subscribers', async () => {
        await appleMessaging.ready();
        await applesAdapter.connect();
        await appleMessaging.broadcast({ message: 'Hello From Apple Publisher' });
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        await tomatoMessaging.ready();
        await tomatoAdapter.connect();
        await tomatoMessaging.broadcast({ message: 'Hello From Tomato Publisher' });
    });
});
