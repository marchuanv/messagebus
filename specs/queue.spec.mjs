import { Message, MessagePriority, MessageType } from '../lib/message.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
class TestMessageBusAdapter extends MessageBusAdapter {
    receivedMsg = null;
    constructor(message) {
        super(message);
    }
    isMessageReady() {
        return true;
    }
    async getMessage() {
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (this.receivedMsg){
                    resolve(this.receivedMsg);
                } else {
                    this.receivedMsg = await this.getMessage();
                    resolve(this.receivedMsg);
                }
            }, 100);
        });
    }
    receiveMessage(message) {
        this.receivedMsg = message;
    }
}
describe('when publishing an apple message on the fruit channel', () => {
    it('should notify all apple subscribers', async () => {
        const testMessageBusAdapter = new TestMessageBusAdapter(
            new Message('apple', 'fruit', MessagePriority.High, MessageType.Default, { message: 'Hello From Apple' })
        );
        const expectedMsg = await testMessageBusAdapter.getMessage();
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple' }));
    });
});
describe('when publishing a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const testMessageBusAdapter = new TestMessageBusAdapter(
            new Message('tomato', 'fruit', MessagePriority.High, MessageType.Default, { message: 'Hello From Tomato' })
        );
        const expectedMsg = await testMessageBusAdapter.getMessage();3
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato' }));
    });
});
