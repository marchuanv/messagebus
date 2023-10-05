import { HttpConnectionPool } from "../http-connection-pool.mjs";
import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { MessageBusChannel } from "./messagebus-channel.mjs";
import { MessageBus } from "./messagebus.mjs";
export class MessageBusManager extends Container {
    /**
     * @param { HttpConnectionPool } httpConnectionPool
    */
    constructor(httpConnectionPool) {
        if (new.target !== MessageBusManager) {
            throw new TypeError(`${MessageBusManager.name} can't be extended.`);
        }
        super();
        Container.setReference(this, httpConnectionPool, HttpConnectionPool.prototype);
        Container.setReference(this, [], MessageBusChannel.prototype, 'messageBusChannels');
    }
    /**
     * @param { Channel } channel
     * @returns { MessageBus }
    */
    ensure(channel) {
        return super.safe(async () => {
            const messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype], 'messageBusChannels');
            let messageBusChannel = null;
            for (const mbc of messageBusChannels) {
                if ((await findMessageBusChannel(mbc, channel))) {
                    messageBusChannel = mbc;
                    break;
                }
            };
            if (!messageBusChannel) {
                const httpConnectionPool = await Container.getReference(this, HttpConnectionPool.prototype);
                const connection = await httpConnectionPool.connect(channel);
                const messageBus = new MessageBus(connection, channel);
                messageBusChannel = new MessageBusChannel(channel, messageBus);
                await messageBusChannels.push(messageBusChannel);
            }
            let messageBus = await messageBusChannel.getMessageBus();
            if (!(await messageBus.isStarted())) {
                await channel.open();
                await messageBus.start();
            }
            return messageBus;
        });
    }
    /**
     * @param { Channel } channel
    */
    async stop(channel) {
        let messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype], 'messageBusChannels');
        const adapterOptions = await Container.getReference(this, AdapterOptions.prototype);
        let _messageBusChannels = [];
        for (const mbc of messageBusChannels) {
            if ((await findMessageBusChannel(mbc, channel))) {
                _messageBusChannels.push(mbc);
            }
        };
        for (const messageBusChannel of _messageBusChannels) {
            await (await messageBusChannel.getChannel()).close();
            await (await messageBusChannel.getMessageBus()).stop();
        }
        const hasStartedMessageBus = (await _messageBusChannels.find(async mbc => (await (mbc.getChannel()).isOpen())) !== undefined);
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