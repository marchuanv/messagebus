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
        super.setReference(channel, Channel.prototype);
        super.setReference(priority, Priority.prototype);
        super.setReference(messageType, MessageType.prototype);
        super.setProperty({ data: {} });
        super.setProperty({ children: [] });
    }
    /**
     * @returns { Channel }
     */
    async getChannel() {
        return await super.getReference(Channel.prototype);
    }
    /**
     * @returns { Priority }
     */
    async getPriority() {
        return await super.getReference(Priority.prototype);
    }
    /**
     * @returns { MessageType }
     */
    async getType() {
        return await super.getReference(MessageType.prototype);
    }
    /**
     * @returns { Object }
     */
    async getData() {
        return await super.getProperty({ data: null }, Object.prototype);
    }
    /**
     * @param { Object } data
     */
    async setData(data) {
        await super.setProperty({ data });
    }
    /**
     * @param { Message } parent
     */
    async setParent(parent) {
        await super.setProperty({ parent });
    }
    /**
     * @returns { Message }
     */
    async getParent() {
        return await Container.get(this, { parent: null }, Message.prototype);
    }
    /**
    * @returns { Boolean }
    */
    async getIsRoot() {
        return (await this.getParent() === undefined);
    }
    /**
     * @param { Message } message
     */
    async setChild(message) {
        const children = await super.getProperty({ children: null }, [Message.prototype]);
        const index = await children.findIndex(async x =>
            (await x.getChannel()) === (await message.getChannel()) &&
            (x.Id !== message.Id)
        );
        const relatedMessage = children[index];
        if (relatedMessage) {
            const priorityTextMessage = `subscriber ${relatedMessage.Id} on the ${await (await relatedMessage.getChannel()).getName()} channel already has the same priority`;
            switch ((await relatedMessage.getPriority())) {
                case Priority.High: {
                    switch ((await message.getPriority())) {
                        case Priority.High: {
                            throw new Error(priorityTextMessage);
                        }
                        default: {
                            await relatedMessage.setChild(message);
                            break;
                        }
                    }
                    break;
                }
                case Priority.Medium: {
                    switch ((await message.getPriority())) {
                        case Priority.High: {
                            await message.setChild(relatedMessage);
                            children.splice(index, 1);
                            children.push(message);
                            await this.reset();
                            await message.setParent(this);
                            break;
                        }
                        case Priority.Medium: {
                            throw new Error(priorityTextMessage);
                        }
                        case Priority.Low: {
                            await relatedMessage.setChild(message);
                            break;
                        }
                        default: {
                            throw new Error(`critical error, unhandled priority`);
                        }
                    }
                    break;
                }
                case Priority.Low: {
                    switch ((await message.getPriority())) {
                        case Priority.Low: {
                            throw new Error(priorityTextMessage);
                        }
                        default: {
                            await message.setChild(relatedMessage);
                            children.splice(index, 1);
                            children.push(message);
                            await this.reset();
                            await message.setParent(this);
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
            await message.setParent(this);
            children.push(message);
            await this.reset();
        }
    }
    /**
     * @returns { Message }
    */
    async getCurrent() {
        const children = await super.getProperty({ children: null }, [Message.prototype]);
        const currentChildIndex = await super.getProperty({ currentChildIndex: null }, Number.prototype);
        return children[currentChildIndex];
    }
    /**
     * @returns { Message }
    */
    async getNext() {
        const children = await super.getProperty({ children: null }, [Message.prototype]);
        if (children.length === 0) {
            return false;
        }
        let currentChildIndex = await super.getProperty({ currentChildIndex: null }, Number.prototype);
        currentChildIndex = currentChildIndex + 1;
        super.setProperty({ currentChildIndex });
        const child = children[currentChildIndex];
        return child !== undefined && child !== null;
    }
    async reset() {
        await super.setProperty({ currentChildIndex: -1 });
    }
    /**
     * @param { Channel } channel
     * @param {Priority} priority
     * @returns {Array<Message>}
     */
    async findAll(channel, priority) {
        await this.reset();
        const thisChannel = await this.getChannel();
        const thisPriority = await this.getPriority();
        const thisIsRoot = await this.getIsRoot();
        const thisCurrent = await this.getCurrent();
        if (thisChannel === channel && thisPriority === priority && !thisIsRoot) {
            return [this];
        }
        let found = [];
        while ((await this.next)) {
            const _found = await thisCurrent.findAll(channel, priority);
            if (_found) {
                found = found.concat(_found);
            }
        }
        await this.reset();
        return found;
    }
    async getLength() {
        const children = await super.getProperty({ children: null }, [Message.prototype]);
        return children.length;
    }
}