import { MessagePriority } from '../lib/message.mjs';
import { MessageBus } from '../messagebus.mjs';
const messageBus = new MessageBus();
describe('', async () => {
    messageBus.subscribe("apples", "fruit", new MessagePriority.High, (data) => {
        return 'Hello World From Subscriber';
    });
    const response = await messageBus.publish("apples", "fruit", new MessagePriority.High, { message: 'Hello World' });
    if (response !== 'Hello World From Subscriber') {
        throw new Error('test failed.');
    }
});
