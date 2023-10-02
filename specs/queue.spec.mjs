
import { Adapter } from '../adapter.mjs';
import { MessageType } from '../lib/messagetype.mjs';
import { Priority } from '../lib/priority.mjs';

const tomatoAdapter = new Adapter('tomato', 'localhost', 3000, 'localhost', 3000);
const applesAdapter = new Adapter('apples', 'localhost', 3000, 'localhost', 3000);

fdescribe('when sending an apple message on the fruit channel', () => {
    it('should notify all apple subscribers', async () => {
        applesAdapter.start();
        applesAdapter.messaging.publish(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        applesAdapter.stop();
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        tomatoAdapter.start();
        await tomatoAdapter.send(Priority.Medium, { message: 'Hello From Tomato Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato Subscriber' }));
        tomatoAdapter.stop();
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        tomatoAdapter.start();
        await tomatoAdapter.send(Priority.Medium, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        await tomatoAdapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        tomatoAdapter.stop();
    });
});
