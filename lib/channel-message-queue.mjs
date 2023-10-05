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
        return this.promise((resolve, reject) => {
            this.poll(async () => {
                const channel = await Container.getReference(this, Channel.prototype);
                const channelMessageQueue = await Container.getReference(this, [Message.prototype], 'messageQueue');
                const channelMessage = await channelMessageQueue.shift();
                if (channelMessage) {

                    if (!(channelMessage instanceof Message)) {
                        const error = new Error(`message shifted from queue is not of type: ${Message.name}`);
                        reject(error);
                        return true;
                    }

                    const messageChannel = await channelMessage.getChannel();

                    const recMsgAddress = await messageChannel.getSource();
                    const recMsgHostPort = await recMsgAddress.getHostPort();

                    const currentAddress = await channel.getSource();
                    const currentHostPort = await currentAddress.getHostPort();

                    if (recMsgHostPort === currentHostPort) {
                        if (!isReceived) {
                            resolve(channelMessage);
                            return true;
                        }
                    } else {
                        if (isReceived) {
                            resolve(channelMessage);
                            return true;
                        }
                    }
                    await channelMessageQueue.push(channelMessage);
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