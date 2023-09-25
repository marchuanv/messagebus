import { MessageBus } from './lib/messagebus.mjs';
import { Message, MessageType } from './lib/message.mjs';
import { Address, Channel, Envelope } from './lib/envelope.mjs';
import { Properties } from './lib/properties.mjs';
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
        properties.set(this, Address.prototype, { channelAddress });
        properties.set(this, Channel.prototype, { channel });
        properties.set(this, Function.prototype, { receive: this.receive });
    }
    /**
     * @param { MessagePriority } messagePriority
     * @param { Object } messageData
     */
    async send(messagePriority, messageData) {
        const recipientAddress = new Address(hostName, hostPort);
        {
            const { obj } = properties.get(this, Channel.prototype, 'channel');
            let envelope = new Envelope(obj, recipientAddress, messagePriority);
        }
        

        const { obj } = properties.get(this, Envelope.prototype, 'envelope');
        const message = new Message(messageName, obj.channel, obj.priority, MessageType.Default, messageData);
        const promise = messageBus.subscribe(message);
        messageBus.publish(message);
        {
            const receivedMessage = await promise;
            const { obj } = properties.get(this, Function.prototype, 'receive');
            await obj(receivedMessage);
        }
    }
    /**
     * @param { Message } message
     */
    async receive(message) {
        await this.receiveMessage(message);
    }
};