import { Message, MessagePriority, MessageType } from './message.mjs';
const subscriptionMessage = new Message('35d501a9-29aa-4ff7-9eaa-e70880f70446', 'subscriptions', MessagePriority.Low, MessageType.Default, null);
const messagePromises = new WeakMap();
export class MessageBus {
    /**
     * @param { Message } message
     */
    subscribe(message) {
        return new Promise((resolve) => {
            let channelMessage = subscriptionMessage.find(message.channel, 'channel', MessagePriority.High);
            if (!channelMessage) {
                channelMessage = new Message(message.channel, 'channel', MessagePriority.High, MessageType.Default, null);
                subscriptionMessage.child = channelMessage;
            }
            let subscriberMessage =
                channelMessage.find(message.name, message.channel, MessagePriority.High) ||
                channelMessage.find(message.name, message.channel, MessagePriority.Medium) ||
                channelMessage.find(message.name, message.channel, MessagePriority.Low);
            if (subscriberMessage) {
                subscriberMessage.parent.child = message;
            } else {
                channelMessage.child = message;
            }
            messagePromises.set(message, resolve);
        });
    }
    /**
     * @param { Message } message
    */
    async publish(message) {
        const subscriberMessage =
                subscriptionMessage.find(message.name, message.channel, MessagePriority.High) ||
                subscriptionMessage.find(message.name, message.channel, MessagePriority.Medium) ||
                subscriptionMessage.find(message.name, message.channel, MessagePriority.Low);
        const resolve = messagePromises.get(subscriberMessage);
        resolve(message);
    }
};