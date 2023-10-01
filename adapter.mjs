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
import { MessageQueue } from './message-queue.mjs';
export class Adapter {
    /**
     * @param { String } channelName
     * @param { String } senderHostName
     * @param { Number } senderHostPort
     * @param { String } receiverHostName
     * @param { Number } receiverHostPort
     * @param { MessageType } messageType
     * @param { Priority } priority
     * @param { AdapterOptions? } adapterOptions
    */
    constructor(channelName, senderHostName, senderHostPort, receiverHostName, receiverHostPort, messageType, priority, adapterOptions = null) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        const source = new SourceAddress(senderHostName, senderHostPort);
        const destination = new DestinationAddress(receiverHostName, receiverHostPort);
        const channel = new Channel(channelName, source, destination);
        const envelope = new Envelope(channel, priority, messageType);
        Container.setReference(this, envelope);
        const _adapterOptions = adapterOptions ? adapterOptions : AdapterOptions.Default;
        const messageBusManager = new MessageBusManager(_adapterOptions);
        Container.setReference(this, messageBusManager);
        const messageQueue = new MessageQueue();
        Container.setReference(this, messageQueue);
        const messageBus = messageBusManager.ensure(envelope.channel);
        setInterval(async () => {
            const message = await messageBus.receive();
            messageQueue.push(message);
        }, 100);
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
    */
    async send(priority, data) {
        const envelope = Container.getReference(this, Envelope.prototype);
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        const messageBus = messageBusManager.ensure(envelope.channel);
        const message = new Message(envelope.channel, priority, MessageType.Default);
        message.data = data;
        envelope.child = message;
        const sent = await messageBus.send(envelope);
        if (!sent) {
            throw new Error(`failed to send envelope`);
        }
    }
    close() {
        const envelope = Container.getReference(this, Envelope.prototype);
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        messageBusManager.stop(envelope.channel);
    }
    /**
     * @returns { MessageQueue } messageQueue
    */
    get messaging(){
        const messageQueue = Container.getReference(this, MessageQueue.prototype);
        return messageQueue;
    }
};
