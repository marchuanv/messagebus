import { MessagePriority } from '../lib/message.mjs';
import { MessageBus } from '../messagebus.mjs';

const messageBus = new MessageBus();
messageBus.start();
messageBus.subscribe("apples", "fruit", MessagePriority.Low, ({ message }) => {
    expect(message).toBe('Hello From Apple Publisher');
    return 'Hello From Apple Subscriber A';
});
messageBus.subscribe("apples", "fruit", MessagePriority.Medium, ({ message }) => {
    expect(message).toBe('Hello From Apple Publisher');
    return 'Hello From Apple Subscriber B';
});
messageBus.subscribe("apples", "fruit", MessagePriority.High, ({ message }) => {
    expect(message).toBe('Hello From Apple Publisher');
    return 'Hello From Apple Subscriber C';
});
messageBus.subscribe("tomato", "fruit", MessagePriority.High, ({ message }) => {
    expect(message).toBe('Hello From Tomato Publisher');
    return 'Hello From Tomato Subscriber';
});

describe('when publishing an apple message on the fruit channel', () => {
    it('should notify all apple subscribers', async () => {
        const results = await messageBus.publish("apples", "fruit", { message: 'Hello From Apple Publisher' });
        expect(results).toBe('Hello From Apple Subscriber C');
    });
});
describe('when publishing a tomato message on the fruit channel', () => {
    it('should notify all tomato subscribers', async () => {
        const results = await messageBus.publish("tomato", "fruit", { message: 'Hello From Tomato Publisher' });
        expect(results).toBe('Hello From Tomato Subscriber');
    });
});
