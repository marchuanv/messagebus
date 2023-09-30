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
     * @param { Channel } channel
    */
    ensureMessageBus(channel) {
        const messageBusChannels = Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = Container.getReference(this, AdapterOptions.prototype);
        const { messageBus } = messageBusChannels.find(mbc =>
            mbc.channel.name === ch.name &&
            mbc.channel.source.hostName === ch.source.hostName &&
            mbc.channel.source.hostPort === ch.source.hostPort &&
            mbc.channel.destination.hostName === ch.destination.hostName &&
            mbc.channel.destination.hostPort === ch.destination.hostPort
        ) || {};
        if (messageBus) {
            return messageBus;
        } else {
            const messageBus = new MessageBus(adapterOptions.server, channel);
            const messageBusChannel = new MessageBusChannel(channel, messageBus);
            messageBusChannels.push(messageBusChannel);
            return messageBus;
        }
    }
}