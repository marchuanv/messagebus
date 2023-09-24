import { MessageBus } from './lib/messagebus.mjs';
import { Message } from './lib/message.mjs';
import { Envelope } from './lib/envelope.mjs';
const privateBag = new WeakMap();
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
        if (!(envelope instanceof Envelope)) {
            throw new TypeError(`envelope is not an instance of ${Envelope.name}`);
        }
        if (!(typeof this.receiveMessage === 'function')) {
            throw new TypeError(`class extending the ${MessageBusAdapter.name} does not have a receiveMessage(message) method`);
        }
        privateBag.set(this, envelope);
    }
    async send(data) {  
        const message = privateBag.get(this);
        const promise = messageBus.subscribe(message);
        messageBus.publish(message);
        const receivedMessage = await promise;
        await this.receiveMessage(receivedMessage);
        setInterval(async () => {
            await this.connect();
        }, 100);
    }
};