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
        Container.setReference(this, channel);
        Container.setReference(this, [ Message.prototype ]);
    }
    /**
     * @param { Boolean} isReceived 
     * @returns { Message }
    */
    shift(isReceived = false) {
        return new Promise((resolve) => {
            const channelMessageQueue = Container.getReference(this,[Message.prototype]);
            const channel = Container.getReference(this, Channel.prototype);
            const shiftId = setInterval(() => {
                const channelMessage = channelMessageQueue.shift();
                if (channelMessage) {
                    if (channelMessage.channel === channel) { //same instance
                        clearInterval(shiftId);
                        resolve(channelMessage);
                    } else {
                        if (isReceived) {
                            clearInterval(shiftId);
                            resolve(channelMessage);
                        } else {
                            channelMessageQueue.push(channelMessage);
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
        const channelMessageQueue = Container.getReference(this,[Message.prototype]);
        channelMessageQueue.push(channelMessage);
    }
    clear() {
        Container.setReference(this, []);
    }
}