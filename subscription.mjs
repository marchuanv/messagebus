import { PublisherMessageQueue } from './lib/message-queue.mjs';
import { MessageBus } from './messagebus.mjs';
import { Message, MessagePriority, MessageType } from './lib/message.mjs';
const privateBag = new WeakMap();
const messageBus = new MessageBus()
export class Subscription {
    /**
     * @param { String } name
     * @param { String } channel
     * @param { MessagePriority } priority
     */
    constructor(name, channel, priority) {
        const messageBus = new MessageBus();
        let prevSendMember = null;
        let prevReceiveMember = null;
        setImmediate(async () => {
            messageBus.subscribe(name, channel, priority, async (data) => {
                const receive = this.getReceiveMember();
                return await receive(data);
            });
            const send = this.getSendMember();
            const results = await messageBus.publish("apples", "fruit", { message: 'Hello From Apple Publisher' });
        });
        const properties = { send, receive };
        privateBag.set(this, properties);
    }
    getReceiveMember() {
        if (this.receive  && typeof this.receive === 'function') {
           return this.receive;
        } else {
            throw new Error('inherting class does not have a receive method member');
        }
    }
    getSendMember() {
        if (this.send && typeof this.send === 'function') {
           return this.send;
        } else {
            throw new Error('inherting class does not have a send method member');
        }
    }
};