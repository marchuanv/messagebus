import { MessageQueue } from './lib/message-queue.mjs';
import { Message, MessagePriority, MessageType } from './lib/message.mjs';

const publishMessage = new Message('991109a9-27c3-4ca9-b30e-f3f267d7dc59', 'publish', MessagePriority.Low, MessageType.Publish, null);
const subscriptionMessage = new Message('35d501a9-29aa-4ff7-9eaa-e70880f70446', 'subscriptions', MessagePriority.Low, MessageType.Subscription, null);

export class MessageBus extends Message {
    /**
     * @param { String } Id
     * @param { String } channel
     * @param { MessagePriority } priority
     * @param { Function } callback
     */
    subscribe(Id, channel, priority, callback) {
        const channelMessage = subscription.find(channel, 'channel');
        if (!channelMessage) {
            channelMessage = new Message(channel, 'channel', MessagePriority.Low, MessageType.Subscription, null);
            subscriptionMessage.child = channelMessage;
        }
        const subscriberMessage = channelMessage.find(Id, channel);
        const newSubscriberMessage = new Message(Id, channel, priority, MessageType.Subscription, null);
        newSubscriberMessage.callback = callback;
        if (subscriberMessage) {
            if (subscriberMessage.priority === MessagePriority.High && newSubscriberMessage.priority === MessagePriority.Low) {
                subscriberMessage.child = newSubscriberMessage
                newSubscriberMessage.parent = newSubscriberMessage;
            } else if (subscriberMessage.priority === MessagePriority.Low && newSubscriberMessage.priority === MessagePriority.High) {
                subscriberMessage.parent = newSubscriberMessage;
                newSubscriberMessage.child = newSubscriberMessage;
            }
        } else {
            channelMessage.child = newSubscriberMessage;
        }
        MessageQueue.enqueue(newSubscriberMessage);
    }
    /**
     * @param { String } Id
     * @param { String } channel
     * @param { MessagePriority } priority
     * @param { Object } data
    */
    publish(Id, channel, priority, data = {}) {
        return new Promise((resolve) => {
            const newPublishMessage = new Message(Id, channel, priority, MessageType.Publish, data);
            newPublishMessage.callback = resolve;
            publishMessage.child = newPublishMessage;
            MessageQueue.enqueue(newPublishMessage);
            setTimeout(() => MessageQueue.dequeue(), 1000);
        });
    }
};