import { MessageBus } from './lib/messagebus.mjs';
import { Message, MessageType } from './lib/message.mjs';
import { Envelope } from './lib/envelope.mjs';
import { Properties, Property } from './lib/properties.mjs';
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
        properties.set(this, new Property(Envelope.prototype, { 
            name: 'envelope',
            value: envelope
        }));
        properties.set(this, new Property(Function.prototype, { 
            name: 'receiveMessage',
            value: this.receiveMessage
        }));
    }
    /**
     * @param { String } messageName
     * @param { Object } messageData
     */
    async send(messageName, messageData, priority) {
        const property = properties.get(this, Envelope.prototype, 'envelope');
        const envelope = property.value;
        const message = new Message(messageName, envelope.channel, envelope.priority, MessageType.Default, messageData);
        const promise = messageBus.subscribe(message);
        messageBus.publish(message);
        const receivedMessage = await promise;
        await this.receiveMessage(receivedMessage);
    }
};