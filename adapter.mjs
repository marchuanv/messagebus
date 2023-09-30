import { AdapterOptions } from './adapter-options.mjs';
import { Address } from './lib/address.mjs';
import { Channel } from './lib/channel.mjs';
import { Container } from './lib/container.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Message } from './lib/message.mjs';
import { MessageBusManager } from './lib/messagebus-manager.mjs';
import { MessageType } from './lib/messagetype.mjs';
import { Priority } from './lib/priority.mjs';
export class Adapter {
    /**
     * @param { String } channelName
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { MessageType } messageType
     * @param { AdapterOptions? } adapterOptions
    */
    constructor(channelName, hostName, hostPort, messageType, adapterOptions = null) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        const address = new Address(hostName, hostPort);
        const channel = new Channel(channelName, address);
        const envelope = new Envelope(channel, address, priority, messageType);
        Container.setReference(this, envelope);
        const _adapterOptions = adapterOptions ? adapterOptions : AdapterOptions.Default;
        const messageBusManager = new MessageBusManager(_adapterOptions);
        Container.setReference(this, messageBusManager);
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
     */
    async send(priority, data) {
        const envelope = Container.getReference(this, Envelope.prototype);
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        const messageBus = messageBusManager.getMessageBus(envelope.channel);
        const message = new Message(envelope.channel, priority, MessageType.Default);
        message.data = data;
        envelope.child = message;
        await messageBus.send(envelope);
    }
};