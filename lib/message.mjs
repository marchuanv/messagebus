const privateBag = new WeakMap();

import crypto from 'node:crypto';
console.log();

export class MessagePriority {
    static get High() {
        if (!privateBag.has(MessagePriorityHigh)) {
            privateBag.set(MessagePriorityHigh, new MessagePriorityHigh());
        }
        return privateBag.get(MessagePriorityHigh);
    }
    static get Medium() {
        if (!privateBag.has(MessagePriorityMedium)) {
            privateBag.set(MessagePriorityMedium, new MessagePriorityMedium());
        }
        return privateBag.get(MessagePriorityMedium);
    }
    static get Low() {
        if (!privateBag.has(MessagePriorityLow)) {
            privateBag.set(MessagePriorityLow, new MessagePriorityLow());
        }
        return privateBag.get(MessagePriorityLow);
    }
}
class MessagePriorityHigh extends MessagePriority { }
class MessagePriorityMedium extends MessagePriority { }
class MessagePriorityLow extends MessagePriority { }

export class MessageType {
    /**
     * @returns { PublishMessageType }
    */
    static get Publish() {
        if (!privateBag.has(PublishMessageType)) {
            privateBag.set(PublishMessageType, new PublishMessageType());
        }
        return privateBag.get(PublishMessageType);
    }
    /**
     * @returns { SubscriptionMessageType }
    */
    static get Subscription() {
        if (!privateBag.has(SubscriptionMessageType)) {
            privateBag.set(SubscriptionMessageType, new SubscriptionMessageType());
        }
        return privateBag.get(SubscriptionMessageType);
    }
}
class SubscriptionMessageType extends MessageType { }
class PublishMessageType extends MessageType { }

export class Message {
    /**
     * @param {String} name
     * @param {String} channel
     * @param { MessagePriority } priority
     * @param { MessageType } type
     * @param {Object} data
     */
    constructor(name, channel, priority, type, data) {
        const properties = {
            parent: null,
            children: [],
            currentChildIndex: -1,
            name,
            Id: crypto.randomUUID(),
            channel,
            priority,
            type,
            data,
            depth: 0,
            callback: async () => {
                throw new Error(`message ${name} on channel ${channel} does not have any callbacks.`);
            }
        };
        if (typeof name !== 'string') {
            throw new Error('invalid name argument');
        }
        if (typeof channel !== 'string') {
            throw new Error('invalid channel argument');
        }
        if (!(priority instanceof MessagePriority)) {
            throw new Error('invalid priority argument');
        }
        if (!(type instanceof MessageType)) {
            throw new Error('invalid type argument');
        }
        privateBag.set(this, properties);
    }
    get name() {
        const { name } = privateBag.get(this);
        return name;
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    get channel() {
        const { channel } = privateBag.get(this);
        return channel;
    }
    /**
     * @returns { MessagePriority }
    */
    get priority() {
        const { priority } = privateBag.get(this);
        return priority;
    }
    get type() {
        const { type } = privateBag.get(this);
        return type;
    }
    get data() {
        const { data } = privateBag.get(this);
        return data;
    }
    /**
     * @param { Message } value
    */
    set parent(value) {
        const vars = privateBag.get(this);
        vars.parent = value;
    }
    /**
     * @returns { Message }
    */
    get parent() {
        const { parent } = privateBag.get(this);
        return parent;
    }
    /**
     * @param { Message } message
    */
    set child(message) {
        const { children } = privateBag.get(this);
        const index = children.findIndex(x =>
            x.name === message.name &&
            x.channel === message.channel &&
            x.Id !== message.Id
        );
        const relatedMessage = children[index];
        if (relatedMessage) {
            const priorityTextMessage = `${relatedMessage.name}(${relatedMessage.Id}) subscriber for ${relatedMessage.channel} channel already has the same priority`;
            switch (relatedMessage.priority) {
                case MessagePriority.High: {
                    switch (message.priority) {
                        case MessagePriority.High: {
                            throw new Error(priorityTextMessage);
                        }
                        default: {
                            relatedMessage.child = message;
                            break;
                        }
                    }
                    break;
                }
                case MessagePriority.Medium: {
                    switch (message.priority) {
                        case MessagePriority.High: {
                            message.child = relatedMessage;
                            children.splice(index, 1);
                            children.push(message);
                            this.reset();
                            message.parent = this;
                            break;
                        }
                        case MessagePriority.Medium: {
                            throw new Error(priorityTextMessage);
                        }
                        case MessagePriority.Low: {
                            relatedMessage.child = message;
                            break;
                        }
                        default: {
                            throw new Error(`critical error, unhandled priority`);
                        }
                    }
                    break;
                }
                case MessagePriority.Low: {
                    switch (message.priority) {
                        case MessagePriority.Low: {
                            throw new Error(priorityTextMessage);
                        }
                        default: {
                            message.child = relatedMessage;
                            children.splice(index, 1);
                            children.push(message);
                            this.reset();
                            message.parent = this;
                            break;
                        }
                    }
                    break;
                }
                default: {
                    throw new Error(`critical error, unhandled priority`);
                }
            }
        } else {
            message.parent = this;
            children.push(message);
            this.reset();
        }
    }
    /**
     * @returns { Message }
    */
    get current() {
        const { children, currentChildIndex } = privateBag.get(this);
        const child = children[currentChildIndex];
        return child;
    }
    /**
     * @returns { Message }
    */
    get next() {
        const vars = privateBag.get(this);
        const { children } = vars;
        if (children.length === 0) {
            return false;
        }
        vars.currentChildIndex = vars.currentChildIndex + 1;
        const { currentChildIndex } = vars;
        const child = children[currentChildIndex];
        return child !== undefined && child !== null;
    }
    reset() {
        const vars = privateBag.get(this);
        vars.currentChildIndex = -1;
    }
    /**
     * @param {String} name
     * @param {String} channel
     * @param {MessagePriority} priority
     */
    find(name, channel, priority) {
        this.reset();
        if (this.name === name && this.channel === channel && this.priority === priority) {
            return this;
        }
        let found = null;
        while (this.next) {
            found = this.current.find(name, channel, priority);
            if (found) {
                break;
            }
        }
        this.reset();
        return found;
    }
    /**
     * @param {Function} func
     */
    set callback(func) {
        if (!(func instanceof Function)) {
            throw new Error('func argument is not a function');
        }
        const vars = privateBag.get(this);
        vars.callback = func;
    }
    /**
     * @param {Object} args
     */
    async notify(args) {
        const { callback } = privateBag.get(this);
        return await callback(args);
    }
    get isDestroyed() {
        if (this.type === MessageType.Publish) {
            return true;
        } else {
            return false;
        }
    }
    get length() {
        const { children } = privateBag.get(this);
        return children.length;
    }
}