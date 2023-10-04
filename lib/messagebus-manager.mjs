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
        super();
        Container.setReference(this, adapterOptions, AdapterOptions.prototype);
        Container.setReference(this, [], MessageBusChannel.prototype, 'messageBusChannels');
    }
    /**
     * @param { Channel } channel
     * @returns { MessageBus }
    */
    async ensure(channel) {
        const messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype], 'messageBusChannels');
        const adapterOptions = await Container.getReference(this, AdapterOptions.prototype);
        let messageBusChannel = (await messageBusChannels.find(async (mbc) => await findMessageBusChannel(mbc, channel)));
        const server = await adapterOptions.getServer();
        if (!messageBusChannel) {
            const messageBus = new MessageBus(server, channel);
            messageBusChannel = new MessageBusChannel(channel, messageBus);
            await messageBusChannels.push(messageBusChannel);
        }
        let messageBus = await messageBusChannel.getMessageBus();
        if (!(await messageBus.isStarted())) {
            await channel.open();
            await messageBus.start();
        }
        return messageBus;

    }
    /**
     * @param { Channel } channel
    */
    async stop(channel) {
        let messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype], 'messageBusChannels');
        const adapterOptions = await Container.getReference(this, AdapterOptions.prototype);
        messageBusChannels = (await messageBusChannels.filter(async mbc => await findMessageBusChannel(mbc, channel)));
        for (const messageBusChannel of messageBusChannels) {
            await (await messageBusChannel.getChannel()).close();
            await (await messageBusChannel.getMessageBus()).stop();
        }
        const hasStartedMessageBus = (await messageBusChannels.find(async mbc => (await (mbc.getChannel()).isOpen())) !== undefined);
        const server = await adapterOptions.getServer();
        if (!hasStartedMessageBus && server.listening) {
            await server.close();
        }
    }
}
/**
 * @param { MessageBusChannel } actualMessageBusChannel
 * @param { Channel } wantedChannel
 */
async function findMessageBusChannel(actualMessageBusChannel, wantedChannel) {

    const actualChannel = await actualMessageBusChannel.getChannel();

    const actualChannelName = await actualChannel.getName();
    const wantedChannelName = await wantedChannel.getName();

    const actualSourceAddress = await actualChannel.getSource();
    const wantedSourceAddress = await wantedChannel.getSource();

    const actualSourceAddressHostName = await actualSourceAddress.getHostName();
    const wantedSourceAddressHostName = await wantedSourceAddress.getHostName();

    const actualSourceAddressHostPort = await actualSourceAddress.getHostPort();
    const wantedSourceAddressHostPort = await wantedSourceAddress.getHostPort();

    const actualDestinationAddress = await actualChannel.getDestination();
    const wantedDestinationAddress = await wantedChannel.getDestination();

    const actualDestinationAddressHostName = await actualDestinationAddress.getHostName();
    const wantedDestinationAddressHostName = await wantedDestinationAddress.getHostName();

    const actualDestinationAddressHostPort = await actualDestinationAddress.getHostPort();
    const wantedDestinationAddressHostPort = await wantedDestinationAddress.getHostPort();

    return (actualChannelName === wantedChannelName &&
        actualSourceAddressHostName === wantedSourceAddressHostName &&
        actualSourceAddressHostPort === wantedSourceAddressHostPort &&
        actualDestinationAddressHostName === wantedDestinationAddressHostName &&
        actualDestinationAddressHostPort === wantedDestinationAddressHostPort
    );
}