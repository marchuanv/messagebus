import { MessageBus } from './lib/messagebus.mjs';
import { Message } from './lib/message.mjs';
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
        setImmediate(async () => {
            this.status = 'ready';
            if (this.isMessageReady()) {
                const promise = messageBus.subscribe(message);
                messageBus.publish(message);
                const receivedMessage = await promise;
                await this.receiveMessage(receivedMessage);
            }
        });
    }
    ready() {
        return new Promise(async(resolve) => {
            setTimeout(async () => {
                if (this.status === 'ready'){
                    resolve('ready');
                } else {
                    await this.ready();
                }
            }, 100);
        });
    }
};