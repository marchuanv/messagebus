import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { MessageBus } from "./messagebus.mjs";
export class MessageBusChannel extends Container {
    /**
     * @param { Channel } channel
     * @param { MessageBus } messageBus
     */
    constructor(channel, messageBus) {
        if (new.target !== MessageBusChannel) {
            throw new TypeError(`${MessageBusChannel.name} can't be extended.`);
        }
        super();
        super.setReference(channel, Channel.prototype);
        super.setReference(messageBus, MessageBus.prototype);
    }
    /**
     * @returns { Channel }
     */
    async getChannel() {
        return await super.getReference(Channel.prototype);
    }
    /**
     * @returns { MessageBus }
     */
    async getMessageBus() {
        return await super.getReference(MessageBus.prototype);
    }
}