import { Message } from '../lib/message.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
class TestMessageBusAdapter extends MessageBusAdapter {
    constructor(channelName, hostName, hostPort) {
        super(channelName, hostName, hostPort);
    }
    receiveMessage(message) {
        expect(message).toBeInstanceOf(Message);
    }
}
describe('when publishing an apple message on the fruit channel',() => {
    it('should notify all apple subscribers', async () => {
        const adapter = new TestMessageBusAdapter('fruit', 'localhost', 3000);
        const expectedMsg = await adapter.send('Hello From Apple');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple' }));
    });
});
describe('when publishing a tomato message on the fruit channel',() => {
    it('should notify all tomato subscribers', async () => {
        const adapter = new TestMessageBusAdapter('tomato', 'localhost', 3000);
        const expectedMsg = await adapter.send('Hello From Tomato');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato' }));
    });
});
