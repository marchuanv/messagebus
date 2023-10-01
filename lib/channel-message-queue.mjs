import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { Message } from "./message.mjs";
export class ChannelMessageQueue extends Container {
    /**
     * @param { Channel } channel 
     */
    constructor(channel) {
        if (new.target !== ChannelMessageQueue) {
            throw new TypeError(`${Messaging.name} can't be extended`);
        }
        Container.setReference(this, channel);
        Container.setReference(this, []);
    }
    /**
     * @returns { Message }
    */
    async shift() {
        const channelMessageQueue = Container.getReference(this,[Message.prototype]);
        const channel = Container.getReference(this, Channel.prototype);
        const channelMessage = channelMessageQueue.shift();
        if (channelMessage.channel === channel) {
           return channelMessage;
        } else {
            channelMessageQueue.push(channelMessage);
        }
    }
    /**
     * @param { Message } channelMessage
    */
    async push(channelMessage) {
        const channelMessageQueue = Container.getReference(this,[Message.prototype]);
        const channel = Container.getReference(this, Channel.prototype);
        if (channelMessage.channel === channel) {
            channelMessageQueue.push(channelMessage);
        }
    }
    async clear() {
        Container.setReference(this, []);
    }
}