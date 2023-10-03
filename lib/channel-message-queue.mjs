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
        Container.setReference(this, channel);
        Container.setReference(this, [Message.prototype]);
    }
    /**
     * @param { Boolean} isReceived
     * @returns { Message }
    */
    shift(isReceived = false) {
        return new Promise(async (resolve) => {
            const channelMessageQueue = await Container.getReference(this, [Message.prototype]);
            const channel = await Container.getReference(this, Channel.prototype);
            const shiftId = setInterval(async () => {
                const channelMessage = await channelMessageQueue.shift();
                if (channelMessage) {
                    if ((await channelMessage.getChannel()) === channel) { //same instance
                        clearInterval(shiftId);
                        resolve(channelMessage);
                    } else {
                        if (isReceived) {
                            clearInterval(shiftId);
                            resolve(channelMessage);
                        } else {
                            await channelMessageQueue.push(channelMessage);
                        }
                    }
                }
            }, 1000);
        });
    }
    /**
     * @param { Message } channelMessage
    */
    async push(channelMessage) {
        const channelMessageQueue = await Container.getReference(this, [Message.prototype]);
        await channelMessageQueue.push(channelMessage);
    }
    async clear() {
        await Container.setReference(this, []);
    }
}