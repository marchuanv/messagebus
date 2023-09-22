const privateBag = new WeakMap();
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
            privateBag.set(PublishMessageType, publish);
        }
        return privateBag.get(PublishMessageType);
    }
    /**
     * @returns { SubscriptionMessageType }
    */
    static get Subscription() {
        if (!privateBag.has(SubscriptionMessageType)) {
            privateBag.set(SubscriptionMessageType, subscription);
        }
        return privateBag.get(SubscriptionMessageType);
    }
}
class SubscriptionMessageType extends MessageType { }
class PublishMessageType extends MessageType { }

export class Message {
    /**
     * @param {String} Id
     * @param {String} channel
     * @param { MessagePriority } priority
     * @param { MessageType } type
     * @param {Object} data
     */
    constructor(Id, channel, priority, type, data) {
        const properties = {
            parent: null,
            children: [],
            currentChildIndex: -1,
            Id,
            channel,
            priority,
            type,
            data,
            depth: 0,
            callback: async () => {
                throw new Error(`message ${Id} on channel ${channel} does not have any callbacks.`);
            }
        };
        if (typeof Id !== 'string') {
            throw new Error('invalid Id argument');
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
     * @param { Message } value
    */
    set child(value) {
        const { children } = privateBag.get(this);
        children.push(value);
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
     * @param {String} Id
     * @param {String} channel
     */
    find(Id, channel) {
        this.reset();
        console.log('-------------------------------------------------------');
        console.log(`Search: ${Id}-${channel}`);
        console.log(`Actual: ${this.Id}-${this.channel}`);
        console.log('-------------------------------------------------------');
        if (this.Id === Id && this.channel === channel) {
            return this;
        }
        let found = null;
        while (this.next) {
            found = this.current.find(Id, channel);
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
        const { callbacks } = privateBag.get(this);
        for (const callback of callbacks) {
            await callback(args);
        }
    }
    get isDestroyed() {
        if (this.type === MessageType.Subscription) {
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