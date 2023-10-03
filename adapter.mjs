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
export class Adapter extends Container {
    /**
     * @param { Messaging } messaging
     * @param { AdapterOptions? } adapterOptions
    */
    constructor(messaging, adapterOptions = null) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        super();
        const _adapterOptions = adapterOptions ? adapterOptions : AdapterOptions.Default;
        const messageBusManager = new MessageBusManager(_adapterOptions);
        const channelMessageQueue = new ChannelMessageQueue(messaging.channel);
        Container.setReference(this, messageBusManager);
        Container.setReference(this, channelMessageQueue);
        Container.setReference(this, messaging);
    }
    connect() {
        const messaging = Container.getReference(this, Messaging.prototype);
        if (!messaging.channel.isOpen) {
            throw new Error(`${JSON.stringify(messaging.channel)} is closed.`);
        }
        const channelMessageQueue = Container.getReference(this, ChannelMessageQueue.prototype);
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        const receiveId = setInterval(async () => {
            if (!messaging.channel.isOpen) {
                channelMessageQueue.clear();
                return clearInterval(receiveId);
            }
            const messageBus = messageBusManager.ensure(messaging.channel);
            const message = await messageBus.receive(Message.prototype); //blocking wait
            channelMessageQueue.push(message);
        }, 100);
        const sendId = setInterval(async () => {
            const messageBus = messageBusManager.ensure(messaging.channel);
            if (!messaging.channel.isOpen) {
                channelMessageQueue.clear();
                return clearInterval(sendId);
            }
            const message = await channelMessageQueue.shift(); //blocking wait
            const sent = await messageBus.send(message);
            if (!sent) {
                throw new Error(`failed to send message`);
            }
        }, 100);
        const notifyId = setInterval(async () => {
            if (!messaging.channel.isOpen) {
                channelMessageQueue.clear();
                return clearInterval(notifyId);
            }
            const message = await channelMessageQueue.shift(true); //blocking wait
            messaging.notify(message);
        }, 100);
    }
};
