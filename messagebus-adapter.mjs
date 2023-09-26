import { MessageBus } from './lib/messagebus.mjs';
import { Message } from './lib/message.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Properties } from './lib/properties.mjs';
import { Channel } from './lib/channel.mjs';
import { Address } from './lib/address.mjs';
import { MessageType } from './lib/messagetype.mjs';
const properties = new Properties();
const messageBus = new MessageBus();
export class MessageBusAdapter {
    /**
     * @param { String } channelName
     * @param { String } hostName
     * @param { Number } hostPort
    */
    constructor(channelName, hostName, hostPort) {
        if (new.target === MessageBusAdapter) {
            throw new TypeError('MessageBusAdapter should be extended');
        }
        const channelAddress = new Address(hostName, hostPort);
        const channel = new Channel(channelName, channelAddress);
        properties.set(this, Address.prototype, 'channelAddress', channelAddress);
        properties.set(this, Channel.prototype, 'channel', channel);
    }
    /**
     * @returns { Channel }
     */
     get channel() {
        return properties.get(this, Channel.prototype, 'channel');
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
     */
    async send(hostName, hostPort, priority, data) {
        const recipientAddress = new Address(hostName, hostPort);
        const channel = properties.get(this, Channel.prototype, 'channel');
        const envelope = new Envelope(channel, recipientAddress, priority);
        const message = new Message(envelope.channel, envelope.priority, MessageType.Default);
        message.data = data;
        const promise = messageBus.subscribe(message);
        messageBus.publish(message);
        const receivedMessage = await promise;
        return await this.receive(receivedMessage);
    }
    /**
     * @param { Message } message
     */
    async receive(message) {
        return await this.receiveMessage(message);
    }
};