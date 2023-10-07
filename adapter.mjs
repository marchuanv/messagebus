import { HttpConnectionPool } from './http-connection-pool.mjs';
import { Container } from './lib/container.mjs';
import { Message } from './lib/message.mjs';
import { MessageBusManager } from './lib/messagebus-manager.mjs';
import { Messaging } from './lib/messaging.mjs';
import { TaskFlag } from './lib/task-flag.mjs';
import { Task } from './lib/task.mjs';
export class Adapter extends Container {
    /**
     * @param { Messaging } messaging
     * @param { HttpConnectionPool } httpConnectionPool
    */
    constructor(messaging, httpConnectionPool) {
        if (new.target !== Adapter) {
            throw new TypeError(`${Adapter.name} can't be extended`);
        }
        super();
        const messageBusManager = new MessageBusManager(httpConnectionPool);
        super.setReference(messageBusManager, MessageBusManager.prototype);
        super.setReference(messaging, Messaging.prototype);
    }
    async connect() {
        const messaging = await this.getReference(Messaging.prototype);
        const messagingChannel = await messaging.getChannel();
        const messagingQueue = await messaging.getQueue();
        if (!(await messagingChannel.isOpen())) {
            throw new Error(`${JSON.stringify(messagingChannel)} is closed.`);
        }
        const messageBusManager = await super.getReference(MessageBusManager.prototype);

        Task.create('receive', this, null, [
            TaskFlag.HandleErrors, TaskFlag.LowPriority, TaskFlag.Repeat 
        ]).queue(null, async function () {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return true;
            }
            const messageBus = await messageBusManager.ensure(messagingChannel);
            const message = await messageBus.receive(Message.prototype); //blocking wait
            await messagingQueue.push(message);
        });

        Task.create('send', this, null, [ 
            TaskFlag.HandleErrors , TaskFlag.LowPriority , TaskFlag.Repeat 
        ]).queue(null, async function () {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return true;
            }
            const messageBus = await messageBusManager.ensure(messagingChannel);
            const message = await messagingQueue.shift(false); //blocking wait
            const sent = await messageBus.send(message);
            if (!sent) {
                throw new Error(`failed to send message`);
            }
        });

        Task.create('handle', this, null, [
            TaskFlag.HandleErrors , TaskFlag.LowPriority , TaskFlag.Repeat 
        ]).queue(null, async function () {
            if (!(await messagingChannel.isOpen())) {
                await messagingQueue.clear();
                return true;
            }
            const message = await messagingQueue.shift(true); //blocking wait
            const data = await message.getData();
            await messaging.handle(data);
        });
    }
};
