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
        Container.setReference(this, channel, Channel.prototype);
        Container.setReference(this, messageBus, MessageBus.prototype);
    }
    /**
     * @returns { Channel }
     */
    async getChannel() {
        return await Container.getReference(this, Channel.prototype);
    }
    /**
     * @returns { MessageBus }
     */
    async getMessageBus() {
        return await Container.getReference(this, MessageBus.prototype);
    }
}