import { Message } from '../lib/message.mjs';
import { MessageType } from '../lib/messagetype.mjs';
import { Priority } from '../lib/priority.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
class TestMessageBusAdapter extends MessageBusAdapter {
    constructor(channelName, hostName, hostPort) {
        super(channelName, hostName, hostPort, Priority.High, MessageType.Default);
    }
    receive(message) {
        expect(message).toBeInstanceOf(Message);
        message.data = { message: `Hello From ${message.channel.name} Subscriber` };
        return message;
    }
}
fdescribe('when publishing an apple message on the fruit channel', () => {
    it('should notify all apple subscribers', async () => {
        const adapter = new TestMessageBusAdapter('Apple', 'localhost', 3000);
        const expectedMsg = await adapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
    });
});
describe('when publishing a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const adapter = new TestMessageBusAdapter('Tomato', 'localhost', 3000);
        const expectedMsg = await adapter.send(Priority.Medium, { message: 'Hello From Tomato Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato Subscriber' }));
    });
});
describe('when publishing a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const adapter = new TestMessageBusAdapter('Apple', 'localhost', 3000);
        let expectedMsg = await adapter.send(Priority.Medium, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
        expectedMsg = await adapter.send(Priority.High, { message: 'Hello From Apple Publisher' });
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple Subscriber' }));
    });
});
