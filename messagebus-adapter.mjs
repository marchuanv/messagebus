import { MessageBus } from './lib/messagebus.mjs';
import { Message } from './lib/message.mjs';
const privateBag = new WeakMap();
const messageBus = new MessageBus();
export class MessageBusAdapter {
    /**
     * @param { Message } message 
     */
    constructor(message) {
        if (!new.target) {
            throw new TypeError('calling MessageBusAdapter constructor without new is invalid');
        }
        if (new.target === MessageBusAdapter) {
            throw new TypeError('MessageBusAdapter should be extended');
        }
        if (!(message instanceof Message)) {
            throw new TypeError(`message is not an instance of ${Message.name}`);
        }
        if (!(typeof this.isMessageReady === 'function')) {
            throw new TypeError(`class extending the ${MessageBusAdapter.name} does not have an isMessageReady method`);
        }
        if (!(typeof this.receiveMessage === 'function')) {
            throw new TypeError(`class extending the ${MessageBusAdapter.name} does not have a receiveMessage(message) method`);
        }
        privateBag.set(this, message);
        setInterval(async () => {
            await this.connect();
        }, 100);
    }
    async connect() {
        if (this.isMessageReady()) {
            const message = privateBag.get(this);
            const promise = messageBus.subscribe(message);
            messageBus.publish(message);
            const receivedMessage = await promise;
            await this.receiveMessage(receivedMessage);
        }
    }
};