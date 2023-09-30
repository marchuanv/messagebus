import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
export class Message extends Container {
    /**
     * @param { Channel } channel
     * @param { Priority } priority
     * @param { MessageType } messageType
     */
    constructor(channel, priority, messageType) {
        super();
        Container.setReference(this, channel);
        Container.setReference(this, priority);
        Container.setReference(this, messageType);
        Container.seProperty(this, { data: {} });
        Container.seProperty(this, { children: [] });
    }
    /**
     * @returns { Channel }
     */
    get channel() {
        return Container.getReference(this, Channel.prototype);
    }
    /**
     * @returns { Priority }
     */
    get priority() {
        return Container.getReference(this, Priority.prototype);
    }
    /**
     * @returns { MessageType }
     */
    get type() {
        return Container.getReference(this, MessageType.prototype);
    }
    /**
     * @returns { Object }
     */
    get data() {
        return Container.getProperty(this, { data: null }, Object.prototype);
    }
    /**
     * @param { Object } data
     */
    set data(data) {
        Container.seProperty(this, { data });
    }
    /**
     * @param { Message } parent
     */
    set parent(parent) {
        Container.seProperty(this, { parent });
    }
    /**
     * @returns { Message }
     */
    get parent() {
        return Container.get(this, { parent: null }, Message.prototype);
    }
    /**
    * @returns { Boolean }
    */
    get isRoot() {
        return this.parent === undefined;
    }
    /**
     * @param { Message } message
     */
    set child(message) {
        const children = Container.getProperty(this, { children: null }, [Message.prototype]);
        const index = children.findIndex(x => x.channel === message.channel && x.Id !== message.Id);
        const relatedMessage = children[index];
        if (relatedMessage) {
            const priorityTextMessage = `subscriber ${relatedMessage.Id} on the ${relatedMessage.channel.name} channel already has the same priority`;
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
        const children = Container.getProperty(this, { children: null }, [Message.prototype]);
        const currentChildIndex = Container.getProperty(this, { currentChildIndex: null }, Number.prototype);
        return children[currentChildIndex];
    }
    /**
     * @returns { Message }
    */
    get next() {
        const children = Container.getProperty(this, { children: null }, [Message.prototype]);
        if (children.length === 0) {
            return false;
        }
        let currentChildIndex = Container.getProperty(this, { currentChildIndex: null }, Number.prototype);
        currentChildIndex = currentChildIndex + 1;
        Container.seProperty(this, { currentChildIndex });
        const child = children[currentChildIndex];
        return child !== undefined && child !== null;
    }
    reset() {
        Container.seProperty(this, { currentChildIndex: -1 });
    }
    /**
     * @param { Channel } channel
     * @param {Priority} priority
     * @returns {Array<Message>}
     */
    findAll(channel, priority) {
        this.reset();
        if (this.channel === channel && this.priority === priority && !this.isRoot) {
            return [this];
        }
        let found = [];
        while (this.next) {
            const _found = this.current.findAll(channel, priority);
            if (_found) {
                found = found.concat(_found);
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