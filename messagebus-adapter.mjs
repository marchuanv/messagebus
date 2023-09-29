import { Address } from './lib/address.mjs';
import { Channel } from './lib/channel.mjs';
import { Container } from './lib/container.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Message } from './lib/message.mjs';
import { MessageBus } from './lib/messagebus.mjs';
import { MessageType } from './lib/messagetype.mjs';
import { Priority } from './lib/priority.mjs';
import { MessageSubscription } from './subscription.mjs';
export class MessageBusAdapter extends MessageBus {
    /**
     * @param { Server } httpServer
     * @param { MessageSubscription } messageSubscription
     * @param { String } channelName
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { Number } priority
     * @param { Number } messageType
    */
    constructor(httpServer, messageSubscription, channelName, hostName, hostPort, priority, messageType) {
        if (new.target !== MessageBusAdapter) {
            throw new TypeError(`${MessageBusAdapter.name} can't be extended`);
        }
        const recipientAddress = new Address(hostName, hostPort);
        const channel = new Channel(channelName, recipientAddress);
        const envelope = new Envelope(channel, recipientAddress, priority, messageType);
        super(httpServer);
        Container.context = this;
        Container.reference = envelope;
        Container.reference = messageSubscription;
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
     */
    async send(priority, data) {
        const envelope = Container.get(this, Envelope.prototype);
        const message = new Message(envelope.channel, priority, MessageType.Default);
        message.data = data;
        envelope.child = message;
        await super.send();
    }
};