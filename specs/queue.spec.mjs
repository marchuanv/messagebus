
import { Adapter } from '../adapter.mjs';
import { MessageType } from '../lib/messagetype.mjs';
import { Priority } from '../lib/priority.mjs';
describe('when sending an apple message on the fruit channel', () => {
    it('should notify all apple subscribers', async () => {
        const applesAdapter = new Adapter('apples', 'localhost', 3000, MessageType.Default);
        const expectedMsg = await applesAdapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const tomatoAdapter = new Adapter('tomato', 'localhost', 3000, MessageType.Default);
        const expectedMsg = await tomatoAdapter.send(Priority.Medium, { message: 'Hello From Tomato Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato Subscriber' }));
    });
});
describe('when sending a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const tomatoAdapter = new Adapter('apples', 'localhost', 3000, MessageType.Default);
        let expectedMsg = await tomatoAdapter.send(Priority.Medium, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        expectedMsg = await tomatoAdapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
    });
});
