import { MessageBus } from './lib/messagebus.mjs';
import { Message, MessageType } from './lib/message.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Properties } from './lib/properties.mjs';
const properties = new Properties();
const messageBus = new MessageBus();
export class MessageBusAdapter {
    /**
     * @param { Envelope } envelope 
     */
    constructor(envelope) {
        if (!new.target) {
            throw new TypeError('calling MessageBusAdapter constructor without new is invalid');
        }
        if (new.target === MessageBusAdapter) {
            throw new TypeError('MessageBusAdapter should be extended');
        }
        properties.set(this, Envelope.prototype, { envelope });
        properties.set(this, Function.prototype, { receive: this.receive });
    }
    /**
     * @param { String } messageName
     * @param { Object } messageData
     */
    async send(messageName, messageData) {
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