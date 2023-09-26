import crypto from 'node:crypto';
import { Channel } from 'node:diagnostics_channel';
import { Properties } from './properties.mjs'
import { Priority } from './priority.mjs';
import { MessageType } from './messagetype.mjs';
const properties = new Properties();
export class Message {
    /**
     * @param { Channel } channel
     * @param { Priority } priority
     * @param { MessageType } messageType
     * @param { Object } message
     */
    constructor(channel, priority, messageType) {
        properties.set(this, String.prototype, 'Id', crypto.randomUUID());
        properties.set(this, Channel.prototype, 'channel', channel );
        properties.set(this, Priority.prototype, 'priority', priority );
        properties.set(this, MessageType.prototype, 'messageType', messageType);
        properties.set(this, [Message.prototype], 'children', []);
    }
    /**
     * @returns { String }
     */
    get Id() {
        return properties.get(this, String.prototype, 'Id');
    }
    /**
     * @returns { Channel }
     */
    get channel() {
        return properties.get(this, Channel.prototype, 'channel');
    }
    /**
     * @returns { Priority }
     */
    get priority() {
        return properties.get(this, Priority.prototype, 'priority');
    }
    /**
     * @returns { MessageType }
     */
    get type() {
        return properties.get(this, MessageType.prototype, 'messageType');
    }
    /**
     * @returns { Object }
     */
    get data() {
        return properties.get(this, Object.prototype, 'data');
    }
    /**
     * @param { Object } value
     */
    set data(value) {
        properties.set(this, Object.prototype, 'data', value);
    }
    /**
     * @param { Message } value
     */
    set parent(value) {
        properties.set(this, Message.prototype, 'parent', value);
    }
    /**
     * @returns { Message }
     */
    get parent() {
        return properties.get(this, Message.prototype, 'parent');
    }
    /**
     * @param { Message } message
     */
    set child(message) {
        const children = properties.get(this, [Message.prototype], 'children');
        const index = children.findIndex(x => x.channel === message.channel && x.Id !== message.Id);
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
        const children = properties.get(this, [Message.prototype], 'children');
        const currentChildIndex = properties.get(this, Number.prototype, 'currentChildIndex');
        return children[currentChildIndex];
    }
    /**
     * @returns { Message }
    */
    get next() {
        const children = properties.get(this, [Message.prototype], 'children');
        if (children.length === 0) {
            return false;
        }
        let currentChildIndex = properties.get(this, Number.prototype, 'currentChildIndex');
        currentChildIndex = currentChildIndex + 1;
        properties.set(this, Number.prototype, 'currentChildIndex', currentChildIndex);
        const child = children[currentChildIndex];
        return child !== undefined && child !== null;
    }
    reset() {
        properties.set(this, Number.prototype, 'currentChildIndex', -1);
    }
    /**
     * @param {String} channel
     * @param {Priority} priority
     */
    find(channel, priority) {
        this.reset();
        if (this.channel === channel && this.priority === priority) {
            return this;
        }
        let found = null;
        while (this.next) {
            found = this.current.find(channel, priority);
            if (found) {
                break;
            }
        }
        this.reset();
        return found;
    }
    get length() {
        const children = properties.get(this, [Message.prototype], 'children');
        return children.length;
    }
}