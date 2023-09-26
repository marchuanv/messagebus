import { Address } from './lib/address.mjs';
import { Channel } from './lib/channel.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Message } from './lib/message.mjs';
import { MessageBus } from './lib/messagebus.mjs';
import { MessageType } from './lib/messagetype.mjs';
import { Priority } from './lib/priority.mjs';
import { Properties } from './lib/properties.mjs';
const properties = new Properties();
export class MessageBusAdapter extends MessageBus {
    /**
     * @param { String } channelName
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { Number } priority
     * @param { Number } messageType
    */
    constructor(channelName, hostName, hostPort, priority, messageType) {
        if (new.target === MessageBusAdapter) {
            throw new TypeError(`${MessageBusAdapter.name} is an abstract class`);
        }
        const recipientAddress = new Address(hostName, hostPort);
        const channel = new Channel(channelName, recipientAddress);
        const envelope = new Envelope(channel, recipientAddress, priority, messageType);
        super(envelope);
        properties.set(this, Envelope.prototype, 'envelope', envelope);
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
     */
    async send(priority, data) {
        const envelope = properties.get(this, Envelope.prototype, 'envelope');
        const message = new Message(envelope.channel, priority, MessageType.Default);
        message.data = data;
        envelope.child = message;
        await super.send();
    }
};