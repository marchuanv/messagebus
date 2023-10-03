import { ChannelMessageQueue } from "./channel-message-queue.mjs";
import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { DestinationAddress } from "./destinationAddress.mjs";
import { Message } from "./message.mjs";
import { MessageBus } from "./messagebus.mjs";
import { Priority } from "./priority.mjs";
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
        if (!this.callback || typeof this.callback === 'function') {
            throw new TypeError(`extending class does not have a callback method`);
        }
        super();
        const source = new SourceAddress(senderHostName, senderHostPort);
        const destination = new DestinationAddress(receiverHostName, receiverHostPort);
        const channel = new Channel(channelName, source, destination);
        Container.setReference(this, channel);
        Container.setReference(this, [ Function.prototype ]);
    }
    /**
     * @returns { Channel }
     */
    get channel() {
        return Container.getReference(this, Channel.prototype);
    }
    /**
     * 
     * @param { Object } message
     */
    async broadcast(data) {
        const channel = Container.getReference(this, Channel.prototype);
        if (message.channel.name === channel.name) {
            await this.callback(data);
        }
    }
}