import crypto from 'node:crypto';
import { Channel } from 'node:diagnostics_channel';
import { Properties } from './properties.mjs'
import { Priority } from './priority.mjs';
const properties = new Properties();


export class MessageType {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        if (properties.has(DefaultMessageType, DefaultMessageType.prototype, 'messageType')) {
            const { obj } = properties.get(DefaultMessageType, DefaultMessageType.prototype, 'messageType');
            return obj;
        } else {
            const messageType = new DefaultMessageType();
            properties.set(DefaultMessageType, DefaultMessageType.prototype, { messageType });
        }
    }
}
class DefaultMessageType extends MessageType { }

export class Message {
    /**
     * @param { Channel } channel
     * @param { Priority } priority
     * @param { MessageType } messageType
     * @param { Object } message
     */
    constructor(channel, priority, messageType, message) {
        properties.set(this, String.prototype, { Id: crypto.randomUUID() });
        properties.set(this, Channel.prototype, { channel });
        properties.set(this, Priority.prototype, { priority });
        properties.set(this, MessageType.prototype, { messageType });
        properties.set(this, Object.prototype, { message });
    }
    get Id() {
        const { obj } = properties.get(this, String.prototype, 'Id');
        return obj;
    }
    get channel() {
        const { obj } = properties.get(this, Channel.prototype, 'channel');
        return obj;
    }
    /**
     * @returns { Priority }
    */
    get priority() {
        const { obj } = properties.get(this, Priority.prototype, 'priority');
        return obj;
    }
    get type() {
        const { obj } = properties.get(this, MessageType.prototype, 'messageType');
        return obj;
    }
    get data() {
        const { obj } = properties.get(this, Object.prototype, 'message');
        return obj;
    }
    /**
     * @param { Message } value
    */
    set parent(value) {
        properties.set(this, Message.prototype, { parent: value });
    }
    /**
     * @returns { Message }
    */
    get parent() {
        const { obj } = properties.get(this, Message.prototype, 'parent');
        return obj;
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
                case Priority.High: {
                    switch (message.priority) {
                        case Priority.High: {
                            throw new Error(priorityTextMessage);
                        }
                        default: {
                            relatedMessage.child = message;
                            break;
                        }
                    }
                    break;
                }
                case Priority.Medium: {
                    switch (message.priority) {
                        case Priority.High: {
                            message.child = relatedMessage;
                            children.splice(index, 1);
                            children.push(message);
                            this.reset();
                            message.parent = this;
                            break;
                        }
                        case Priority.Medium: {
                            throw new Error(priorityTextMessage);
                        }
                        case Priority.Low: {
                            relatedMessage.child = message;
                            break;
                        }
                        default: {
                            throw new Error(`critical error, unhandled priority`);
                        }
                    }
                    break;
                }
                case Priority.Low: {
                    switch (message.priority) {
                        case Priority.Low: {
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
        const { obj } = properties.get(this, Message.prototype, 'children');
        return obj;
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
     * @param {Priority} priority
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
    get length() {
        const { children } = privateBag.get(this);
        return children.length;
    }
}