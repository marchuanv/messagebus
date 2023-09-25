import { Address, Channel, Envelope } from '../lib/envelope.mjs';
import { MessageType } from '../lib/message.mjs';
import { Priority } from '../lib/priority.mjs';
import { MessageBusAdapter } from '../messagebus-adapter.mjs';
class TestMessageBusAdapter extends MessageBusAdapter {
    /**
     * @param { String } channelName
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { Priority } priority
     */
    constructor(channelName, hostName, hostPort, priority) {
        const recipientAddress = new Address(hostName, hostPort);
        const channelAddress = new Address(hostName, hostPort);
        const channel = new Channel(channelName, channelAddress);
        const envelope = new Envelope(channel, recipientAddress, priority);
        super(envelope);
    }
    receiveMessage(message) {
        this.receivedMsg = message;
    }
}
describe('when publishing an apple message on the fruit channel',() => {
    it('should notify all apple subscribers', async () => {
        const adapter = new TestMessageBusAdapter('fruit', 'localhost', 3000, MessageType.Default);
        const expectedMsg = await adapter.send('Hello From Apple');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Apple' }));
    });
});
describe('when publishing a tomato message on the fruit channel',() => {
    it('should notify all tomato subscribers', async () => {
        const adapter = new TestMessageBusAdapter('tomato', 'localhost', 3000, MessageType.Default);
        const expectedMsg = await adapter.send('Hello From Tomato');
        expect(JSON.stringify(expectedMsg.data)).toBe(JSON.stringify({ message: 'Hello From Tomato' }));
    });
});
