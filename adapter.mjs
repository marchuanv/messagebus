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
    async connect() {
        const messaging = await Container.getReference(this, Messaging.prototype);
        const messagingChannel = (await messaging.getChannel());
        const messagingQueue = (await messaging.getQueue());
        if (!(await messagingChannel.isOpen())) {
            throw new Error(`${JSON.stringify(messagingChannel)} is closed.`);
        }
        const messageBusManager = await Container.getReference(this, MessageBusManager.prototype);
        const receiveId = setInterval(async () => {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return clearInterval(receiveId);
            }
            const messageBus = await messageBusManager.ensure(messagingChannel);
            const message = await messageBus.receive(Message.prototype); //blocking wait
            await messagingQueue.push(message);
        }, 100);
        const sendId = setInterval(async () => {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return clearInterval(sendId);
            }
            const messageBus = messageBusManager.ensure(messagingChannel);
            const message = await messagingQueue.shift(); //blocking wait
            const sent = await messageBus.send(message);
            if (!sent) {
                throw new Error(`failed to send message`);
            }
        }, 100);
        const notifyId = setInterval(async () => {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return clearInterval(notifyId);
            }
            const message = await messagingQueue.shift(true); //blocking wait
            await messaging.handle((await message.getData()));
        }, 100);
    }
};
