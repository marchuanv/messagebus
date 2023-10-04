import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { Message } from "./message.mjs";
import { Messaging } from "./messaging.mjs";
export class ChannelMessageQueue extends Container {
    /**
     * @param { Channel } channel
     */
    constructor(channel) {
        if (new.target !== ChannelMessageQueue) {
            throw new TypeError(`${Messaging.name} can't be extended`);
        }
        super();
        Container.setReference(this, channel, Channel.prototype);
        Container.setReference(this, [], Message.prototype, 'messageQueue');
    }
    /**
     * @param { Boolean} isReceived
     * @returns { Message }
    */
    shift(isReceived = false) {
        return this.promise(async (resolve) => {
            const channelMessageQueue = await Container.getReference(this, [Message.prototype], 'messageQueue');
            const channel = await Container.getReference(this, Channel.prototype);
            this.poll(async () => {
                const channelMessage = await channelMessageQueue.shift();
                if (channelMessage) {
                    const messageChannel = await channelMessage.getChannel();
                    if (messageChannel === channel) { //same instance
                        resolve(channelMessage);
                        return true;
                    } else {
                        if (isReceived) {
                            resolve(channelMessage);
                            return true;
                        } else {
                            await channelMessageQueue.push(channelMessage);
                        }
                    }
                }
            });
        });
    }
    /**
     * @param { Message } channelMessage
    */
    async push(channelMessage) {
        const channelMessageQueue = await Container.getReference(this, [Message.prototype], 'messageQueue');
        await channelMessageQueue.push(channelMessage);
    }
    async clear() {
        await Container.setReference(this, [], Message.prototype);
    }
}