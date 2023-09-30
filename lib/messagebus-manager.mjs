import { AdapterOptions } from "../adapter-options.mjs";
import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { MessageBusChannel } from "./messagebus-channel.mjs";
import { MessageBus } from "./messagebus.mjs";
export class MessageBusManager extends Container {
    /**
     * @param { AdapterOptions } adapterOptions
    */
    constructor(adapterOptions) {
        if (new.target !== MessageBusManager) {
            throw new TypeError(`${MessageBusManager.name} can't be extended.`);
        }
        Container.setReference(this, adapterOptions);
        Container.setReference(this, []);
    }
    /**
     * @param { Channel } ch
    */
    getMessageBus(ch) {
        const messageBusChannels = Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = Container.getReference(this, AdapterOptions.prototype);
        const { messageBus, channel } = messageBusChannels.find(mbc =>
            mbc.channel.name === ch.name &&
            mbc.channel.address.hostName === ch.address.hostName &&
            mbc.channel.address.hostPort === ch.address.hostPort
        ) || {};
        if (messageBus) {
            return messageBus;
        } else {
            const messageBus = new MessageBus(adapterOptions.server, channel.address);
            const messageBusChannel = new MessageBusChannel(channel, messageBus);
            messageBusChannels.push(messageBusChannel);
            return messageBus;
        }
    }
}