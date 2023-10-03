
import { Adapter } from '../adapter.mjs';
import { MessageType } from '../lib/messagetype.mjs';
import { Messaging } from '../lib/messaging.mjs';
import { Priority } from '../lib/priority.mjs';

class AppleMessaging extends Messaging {
    constructor() {
        super('apples', 'localhost', 3000, 'localhost', 3000);
    }
    callback(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Apple Publisher' }));
    }
}
class TomatoMessaging extends Messaging {
    constructor() {
        super('tomato', 'localhost', 3000, 'localhost', 3000);
    }
    callback(data) {
        expect(JSON.stringify(data)).toBe(JSON.stringify({ message: 'Hello From Tomato Publisher' }));
    }
}

const appleMessaging = new AppleMessaging();
const tomatoMessaging = new TomatoMessaging();

const tomatoAdapter = new Adapter(appleMessaging);
const applesAdapter = new Adapter(tomatoMessaging);

fdescribe('when sending a message on the apple channel', () => {
    it('should notify all apple subscribers', async () => {
        applesAdapter.connect();
        appleMessaging.broadcast({ message: 'Hello From Apple Publisher' });
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        tomatoAdapter.connect();
        tomatoMessaging.broadcast({ message: 'Hello From Tomato Publisher' });
    });
});
