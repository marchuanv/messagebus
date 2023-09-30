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
        Container.setReference(this, channel);
        Container.setReference(this, messageBus);
    }
    /**
     * @returns { Channel }
     */
    get channel() {
        return Container.getReference(this, Channel.prototype);
    }
    /**
     * @returns { MessageBus }
     */
    get messageBus() {
        return Container.getReference(this, MessageBus.prototype);
    }
}