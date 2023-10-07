import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { Message } from "./message.mjs";
import { Messaging } from "./messaging.mjs";
import { TaskFlag } from "./task-flag.mjs";
import { Task } from "./task.mjs";
export class ChannelMessageQueue extends Container {
    /**
     * @param { Channel } channel
     */
    constructor(channel) {
        if (new.target !== ChannelMessageQueue) {
            throw new TypeError(`${Messaging.name} can't be extended`);
        }
        super();
        super.setReference(channel, Channel.prototype);
        super.setReference([], Message.prototype, 'messageQueue');
    }
    /**
     * @param { Boolean} isReceived
    */
    shift(isReceived = false) {
        return Task.create('shift', this, isReceived, [ 
            TaskFlag.HandleErrors , TaskFlag.LowPriority , TaskFlag.OnceOff , TaskFlag.WaitForValidResponse
        ]).queue(Message.prototype, async function (instance, isReceived) {
            const channel = await instance.getReference(Channel.prototype);
            const channelMessageQueue = await instance.getReference([Message.prototype], 'messageQueue');
            const channelMessage = await channelMessageQueue.shift();
            if (channelMessage) {

                if (!(channelMessage instanceof Message)) {
                    throw new Error(`message shifted from queue is not of type: ${Message.name}`);
                }

                const messageChannel = await channelMessage.getChannel();

                const recMsgAddress = await messageChannel.getSource();
                const recMsgHostPort = await recMsgAddress.getHostPort();

                const currentAddress = await channel.getSource();
                const currentHostPort = await currentAddress.getHostPort();

                if (recMsgHostPort === currentHostPort) {
                    if (!isReceived) {
                        return this.complete(channelMessage);
                    }
                } else {
                    if (isReceived) {
                        return this.complete(channelMessage);
                    }
                }
                await channelMessageQueue.push(channelMessage);
            }
        });
    }
    /**
     * @param { Message } channelMessage
    */
    async push(channelMessage) {
        const channelMessageQueue = await super.getReference([Message.prototype], 'messageQueue');
        await channelMessageQueue.push(channelMessage);
    }
    async clear() {
        await super.setReference([], Message.prototype);
    }
}