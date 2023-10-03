import { AdapterOptions } from './adapter-options.mjs';
import { Container } from './lib/container.mjs';
import { Message } from './lib/message.mjs';
import { MessageBusManager } from './lib/messagebus-manager.mjs';
import { Messaging } from './lib/messaging.mjs';
export class Adapter extends Container {
    /**
     * @param { Messaging } messaging
     * @param { AdapterOptions? } adapterOptions
    */
    constructor(messaging, adapterOptions = null) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        super();
        const _adapterOptions = adapterOptions ? adapterOptions : AdapterOptions.Default;
        const messageBusManager = new MessageBusManager(_adapterOptions);
        Container.setReference(this, messageBusManager);
        Container.setReference(this, messaging);
    }
    connect() {
        const messaging = Container.getReference(this, Messaging.prototype);
        if (!messaging.channel.isOpen) {
            throw new Error(`${JSON.stringify(messaging.channel)} is closed.`);
        }
        const messageBusManager = Container.getReference(this, MessageBusManager.prototype);
        const receiveId = setInterval(async () => {
            if (!messaging.channel.isOpen) {
                messaging.queue.clear();
                return clearInterval(receiveId);
            }
            const messageBus = messageBusManager.ensure(messaging.channel);
            const message = await messageBus.receive(Message.prototype); //blocking wait
            messaging.queue.push(message);
        }, 100);
        const sendId = setInterval(async () => {
            if (!messaging.channel.isOpen) {
                messaging.queue.clear();
                return clearInterval(sendId);
            }
            const messageBus = messageBusManager.ensure(messaging.channel);
            const message = await messaging.queue.shift(); //blocking wait
            const sent = await messageBus.send(message);
            if (!sent) {
                throw new Error(`failed to send message`);
            }
        }, 100);
        const notifyId = setInterval(async () => {
            if (!messaging.channel.isOpen) {
                messaging.queue.clear();
                return clearInterval(notifyId);
            }
            const message = await messaging.queue.shift(true); //blocking wait
            await messaging.handle(message.data);
        }, 100);
    }
};
