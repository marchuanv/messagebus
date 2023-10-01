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
     * @returns { MessageBus }
    */
    ensure(channel) {
        const messageBusChannels = Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = Container.getReference(this, AdapterOptions.prototype);
        const { messageBus } = messageBusChannels.find(mbc =>
            mbc.channel.name === channel.name &&
            mbc.channel.source.hostName === channel.source.hostName &&
            mbc.channel.source.hostPort === channel.source.hostPort &&
            mbc.channel.destination.hostName === channel.destination.hostName &&
            mbc.channel.destination.hostPort === channel.destination.hostPort
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
    /**
     * @param { Channel } channel
    */
    stop(channel) {
        let messageBusChannels = Container.getReference(this, [MessageBusChannel.prototype]);
        messageBusChannels = messageBusChannels.find(mbc =>
            mbc.channel.name === channel.name &&
            mbc.channel.source.hostName === channel.source.hostName &&
            mbc.channel.source.hostPort === channel.source.hostPort &&
            mbc.channel.destination.hostName === channel.destination.hostName &&
            mbc.channel.destination.hostPort === channel.destination.hostPort
        );
        for (const messageBusChannel of messageBusChannels) {
            messageBusChannel.channel.close();
            messageBusChannel.messageBus.stop();
        }
    }
}