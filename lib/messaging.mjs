import { ChannelMessageQueue } from './channel-message-queue.mjs';
import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { DestinationAddress } from "./destinationAddress.mjs";
import { Message } from './message.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
import { SourceAddress } from "./sourceAddress.mjs";
export class Messaging extends Container {
    /**
     * @param { String } channelName
     * @param { String } senderHostName
     * @param { Number } senderHostPort
     * @param { String } receiverHostName
     * @param { Number } receiverHostPort
    */
    constructor(channelName, senderHostName, senderHostPort, receiverHostName, receiverHostPort) {
        if (new.target === Messaging) {
            throw new TypeError(`${Messaging.name} should be extended.`);
        }
        super();
        if (!this.handle || typeof this.handle !== 'function') {
            throw new TypeError(`extending class does not have a handle method`);
        }
        const source = new SourceAddress(senderHostName, senderHostPort);
        const destination = new DestinationAddress(receiverHostName, receiverHostPort);
        const channel = new Channel(channelName, source, destination);
        const channelMessageQueue = new ChannelMessageQueue(channel);
        Container.setReference(this, channel, Channel.prototype);
        Container.setReference(this, channelMessageQueue, ChannelMessageQueue.prototype);
    }
    /**
     * @returns { Channel }
     */
    async getChannel() {
        return await Container.getReference(this, Channel.prototype);
    }
    /**
    * @returns { ChannelMessageQueue }
    */
    async getQueue() {
        return await Container.getReference(this, ChannelMessageQueue.prototype);
    }
    /**
     * @param { Object } message
     */
    async broadcast(data) {
        const channelMessageQueue = await Container.getReference(this, ChannelMessageQueue.prototype);
        const channel = await Container.getReference(this, Channel.prototype);
        const message = new Message(channel, Priority.High, MessageType.Default);
        await message.setData(data);
        await channelMessageQueue.push(message);
    }
}