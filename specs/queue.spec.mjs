import { Message, MessagePriority, MessageType } from '../lib/message.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
class TestMessageBusAdapter extends MessageBusAdapter {
    receivedMsg = null;
    constructor(message) {
        super(message);
    }
    receiveMessage(message) {
        this.receivedMsg = message;
    }
}
describe('when publishing an apple message on the fruit channel',() => {
    it('should notify all apple subscribers', async () => {
        const adapter = new TestMessageBusAdapter(new Message('apple', 'fruit', MessagePriority.High, MessageType.Default));
        const expectedMsg = await adapter.send('Hello From Apple');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple' }));
    });
});
describe('when publishing a tomato message on the fruit channel',() => {
    it('should notify all tomato subscribers', async () => {
        const adapter = new TestMessageBusAdapter(new Message('tomato', 'fruit', MessagePriority.High, MessageType.Default));
        const expectedMsg = await adapter.send('Hello From Tomato');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato' }));
    });
});
