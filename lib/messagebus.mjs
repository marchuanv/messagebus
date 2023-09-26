import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Message } from './message.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
const subscriptionMessage = new Message(
    new Channel('subscriptions', new Address('localhost', 3000)),
    Priority.Low,
    MessageType.Default
);
const messagePromises = new WeakMap();
export class MessageBus {
    /**
     * @param { Message } message
     */
    subscribe(message) {
        return new Promise((resolve) => {
            let channelMessage = subscriptionMessage.find(message.channel, 'channel', Priority.High);
            if (!channelMessage) {
                channelMessage = new Message(message.channel, Priority.High, MessageType.Default);
                subscriptionMessage.child = channelMessage;
            }
            let subscriberMessage =
                channelMessage.find(message.channel, Priority.High) ||
                channelMessage.find(message.channel, Priority.Medium) ||
                channelMessage.find(message.channel, Priority.Low);
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
            subscriptionMessage.find(message.channel, Priority.High) ||
            subscriptionMessage.find(message.channel, Priority.Medium) ||
            subscriptionMessage.find(message.channel, Priority.Low);
        const resolve = messagePromises.get(subscriberMessage);
        resolve(message);
    }
};