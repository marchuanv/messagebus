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
        let { messageBus } = messageBusChannels.find(mbc =>
            mbc.channel.name === channel.name &&
            mbc.channel.source.hostName === channel.source.hostName &&
            mbc.channel.source.hostPort === channel.source.hostPort &&
            mbc.channel.destination.hostName === channel.destination.hostName &&
            mbc.channel.destination.hostPort === channel.destination.hostPort
        ) || {};
        if (!messageBus) {
            messageBus = new MessageBus(adapterOptions.server, channel);
            const messageBusChannel = new MessageBusChannel(channel, messageBus);
            messageBusChannels.push(messageBusChannel);
        }
        if (!adapterOptions.server.listening) {
            adapterOptions.server.listen(channel.source.hostPort, () => console.log(`http server is listening on port ${channel.source.hostPort}`));
        }
        channel.open();
        messageBus.start();
        return messageBus;
    }
    /**
     * @param { Channel } channel
    */
    stop(channel) {
        let messageBusChannels = Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = Container.getReference(this, AdapterOptions.prototype);
        messageBusChannels = messageBusChannels.filter(mbc =>
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
        const hasStartedMessageBus = messageBusChannels.find(mbc => mbc.messageBus.isStarted) !== undefined;
        if (!hasStartedMessageBus && adapterOptions.server.listening) {
            adapterOptions.server.close();
        }
    }
}