import { AdapterOptions } from './adapter-options.mjs';
import { Channel } from './lib/channel.mjs';
import { Container } from './lib/container.mjs';
import { DestinationAddress } from './lib/destinationAddress.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Message } from './lib/message.mjs';
import { MessageBusManager } from './lib/messagebus-manager.mjs';
import { MessageType } from './lib/messagetype.mjs';
import { Priority } from './lib/priority.mjs';
import { SourceAddress } from './lib/sourceAddress.mjs';
import { ChannelMessageQueue } from './lib/channel-message-queue.mjs';
import { MessageBus } from './lib/messagebus.mjs';
import { Messaging } from './lib/messaging.mjs';
export class Adapter {
    /**
     * @param { String } channelName
     * @param { String } senderHostName
     * @param { Number } senderHostPort
     * @param { String } receiverHostName
     * @param { Number } receiverHostPort
     * @param { AdapterOptions? } adapterOptions
    */
    constructor(channelName, senderHostName, senderHostPort, receiverHostName, receiverHostPort, adapterOptions = null) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        const source = new SourceAddress(senderHostName, senderHostPort);
        const destination = new DestinationAddress(receiverHostName, receiverHostPort);
        const channel = new Channel(channelName, source, destination);
        const _adapterOptions = adapterOptions ? adapterOptions : AdapterOptions.Default;
        const messageBusManager = new MessageBusManager(_adapterOptions);
        const channelMessageQueue = new ChannelMessageQueue(channel);
        const messaging = new Messaging(channelMessageQueue);
        Container.setReference(this, channel);
        Container.setReference(this, channelMessageQueue);
        Container.setReference(this, messageBusManager);
        Container.setReference(this, messaging);
    }
    start() {
        const channel = Container.getReference(this, Channel.prototype);
        const channelMessageQueue = Container.getReference(this, ChannelMessageQueue.prototype);
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        const messageBus = messageBusManager.ensure(channel);
        const receiveId = setInterval(async () => {
            const message = await messageBus.receive(Message.prototype);
            if (message) {
                if (!channel.isOpen) {
                    channelMessageQueue.clear();
                    return clearInterval(receiveId);
                }
                channelMessageQueue.push(message);
            }
        }, 100);
        const sendId = setInterval(async () => {
            const message = await channelMessageQueue.shift();
            if (!channel.isOpen) {
                channelMessageQueue.clear();
                return clearInterval(sendId);
            }
            if (message) {
                const sent = await messageBus.send(message);
                if (!sent) {
                  throw new Error(`failed to send message`);
                }
            }
        }, 100);
    }
    stop() {
        const channel = Container.getReference(this, Channel.prototype);
        channel.close();
    }
    /**
     * @returns { Messaging }
    */
    get messaging() {
        return Container.getReference(this, Messaging.prototype);
    }
};
