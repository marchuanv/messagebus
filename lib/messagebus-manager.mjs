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
        Container.setReference(this, adapterOptions);
        Container.setReference(this, []);
    }
    /**
     * @param { Channel } channel
     * @returns { MessageBus }
    */
    async ensure(channel) {
        await this.ready();
        const messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = await Container.getReference(this, AdapterOptions.prototype);
        const messageBusChannel = (await messageBusChannels.find(async (mbc) =>
            (await (await mbc.getChannel()).getName()) === (await channel.getName()) &&
            (await (await (await mbc.getChannel()).getSource()).getHostName()) === (await (await channel.getSource()).getHostName()) &&
            (await (await (await mbc.getChannel()).getSource()).hostPort()) === (await (await channel.getSource()).hostPort()) &&
            (await (await (await mbc.getChannel()).getDestination()).getHostName()) === (await (await channel.getDestination()).getHostName()) &&
            (await (await (await mbc.getChannel()).getDestination()).hostPort()) === (await (await channel.getDestination()).hostPort())
        ));
        let messageBus = await messageBusChannel.getMessageBus();
        const server = await adapterOptions.getServer();
        if (!messageBus) {
            messageBus = new MessageBus(server, channel);
            const messageBusChannel = new MessageBusChannel(channel, messageBus);
            await messageBusChannels.push(messageBusChannel);
        }
        if (!server.listening) {
            const hostPort = await channel.getSource();
            await server.listen(hostPort, () => console.log(`http server is listening on port ${hostPort}`));
        }
        await channel.open();
        await messageBus.start();
        return messageBus;
    }
    /**
     * @param { Channel } channel
    */
    async stop(channel) {
        let messageBusChannels = await Container.getReference(this, [MessageBusChannel.prototype]);
        const adapterOptions = await Container.getReference(this, AdapterOptions.prototype);
        messageBusChannels = (await messageBusChannels.filter(async mbc =>
            (await (await mbc.getChannel()).getName()) === (await channel.getName()) &&
            (await (await (await mbc.getChannel()).getSource()).getHostName()) === (await (await channel.getSource()).getHostName()) &&
            (await (await (await mbc.getChannel()).getSource()).hostPort()) === (await (await channel.getSource()).hostPort()) &&
            (await (await (await mbc.getChannel()).getDestination()).getHostName()) === (await (await channel.getDestination()).getHostName()) &&
            (await (await (await mbc.getChannel()).getDestination()).hostPort()) === (await (await channel.getDestination()).hostPort())
        ));
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