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
        if (!this.handle || typeof this.handle === 'function') {
            throw new TypeError(`extending class does not have a handle method`);
        }
        super();
        const source = new SourceAddress(senderHostName, senderHostPort);
        const destination = new DestinationAddress(receiverHostName, receiverHostPort);
        const channel = new Channel(channelName, source, destination);
        const channelMessageQueue = new ChannelMessageQueue(channel);
        Container.setReference(this, channel);
        Container.setReference(this, channelMessageQueue);
    }
    /**
     * @returns { Channel }
     */
    get channel() {
        return Container.getReference(this, Channel.prototype);
    }
    /**
    * @returns { ChannelMessageQueue }
    */
    get queue() {
        return Container.getReference(this, ChannelMessageQueue.prototype);
    }
    /**
     * @param { Object } message
     */
    async broadcast(data) {
        const channelMessageQueue = Container.getReference(this, ChannelMessageQueue.prototype);
        const channel = Container.getReference(this, Channel.prototype);
        const message = new Message(channel, Priority.High, MessageType.Default);
        message.data = data;
        channelMessageQueue.push(message);
    }
}