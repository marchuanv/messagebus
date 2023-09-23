import { PublisherMessageQueue } from './lib/message-queue.mjs';
import { Message, MessagePriority, MessageType } from './lib/message.mjs';

const publishMessage = new Message('991109a9-27c3-4ca9-b30e-f3f267d7dc59', 'publish', MessagePriority.Low, MessageType.Publish, null);
const subscriptionMessage = new Message('35d501a9-29aa-4ff7-9eaa-e70880f70446', 'subscriptions', MessagePriority.Low, MessageType.Subscription, null);

const publisherMessageQueue = new PublisherMessageQueue();

export class MessageBus {
    /**
     * @param { String } name
     * @param { String } channel
     * @param { MessagePriority } priority
     * @param { Function } callback
     */
    subscribe(name, channel, priority, callback) {
        let channelMessage = subscriptionMessage.find(channel, 'channel', MessagePriority.High);
        if (!channelMessage) {
            channelMessage = new Message(channel, 'channel', MessagePriority.High, MessageType.Subscription, null);
            subscriptionMessage.child = channelMessage;
        }
        const newSubscriberMessage = new Message(name, channel, priority, MessageType.Subscription, null);
        newSubscriberMessage.callback = callback;
        let subscriberMessage =
            channelMessage.find(name, channel, MessagePriority.High) ||
            channelMessage.find(name, channel, MessagePriority.Medium) ||
            channelMessage.find(name, channel, MessagePriority.Low);
        if (subscriberMessage) {
            subscriberMessage.parent.child = newSubscriberMessage;
        } else {
            channelMessage.child = newSubscriberMessage;
        }
    }
    /**
     * @param { String } name
     * @param { String } channel
     * @param { Object } data
    */
    publish(name, channel, data = {}) {
        return new Promise((resolve) => {
            const newPublishMessage = new Message(name, channel, MessagePriority.High, MessageType.Publish, data);
            newPublishMessage.callback = resolve;
            publishMessage.child = newPublishMessage;
            publisherMessageQueue.enqueue(newPublishMessage);
        });
    }
    start() {
        setInterval(async () => {
            const publisherMessage = publisherMessageQueue.dequeue();
            if (publisherMessage) {
                let results_A = null;
                let results_B = null;
                let results_C = null;
                let subscriberMessage = subscriptionMessage.find(publisherMessage.name, publisherMessage.channel, MessagePriority.High);
                results_A = await subscriberMessage.notify(publisherMessage.data);
                subscriberMessage = subscriberMessage.find(publisherMessage.name, publisherMessage.channel, MessagePriority.Medium);
                if (subscriberMessage) {
                    results_B = await subscriberMessage.notify(publisherMessage.data);
                    subscriberMessage = subscriberMessage.find(publisherMessage.name, publisherMessage.channel, MessagePriority.Low);
                    if (subscriberMessage) {
                        results_C = await subscriberMessage.notify(publisherMessage.data);
                    }
                }
                if (results_A) {
                    return await publisherMessage.notify(results_A);
                }
                if (results_B) {
                    return await publisherMessage.notify(results_B);
                }
                if (results_C) {
                    return await publisherMessage.notify(results_C);
                }
            }
        }, 1000);
    }
};