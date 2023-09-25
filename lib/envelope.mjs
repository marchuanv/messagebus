import crypto from 'node:crypto';
import { Properties, Property } from '../lib/properties.mjs';
import { Message } from './message.mjs';
const properties = new Properties();
export class Address {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        properties.set(this, new Property(String.prototype, { hostName }));
        properties.set(this, new Property(Number.prototype, { hostPort }));
    }
    get hostname() {
        const { hostname } = properties.get(this, String.prototype);
        return hostname;
    }
}
export class Channel {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        properties.set(this, new Property(String.prototype, { name }));
        properties.set(this, new Property(Address.prototype, { address }));
    }
    get name() {
        const { name } = properties.get(this, String.prototype);
        return name;
    }
    get address() {
        const { address } = properties.get(this, Address.prototype);
        return address;
    }
}
export class Priority {
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
class PriorityHigh extends Priority { }
class PriorityMedium extends Priority { }
class PriorityLow extends Priority { }

export class Envelope {
    /**
     * @param { Channel } channel
     * @param { Address } address
     * @param { Priority } priority
     */
    constructor(channel, address, priority) {
        properties.set(this, new Property(String.prototype, { Id: crypto.randomUUID() }));
        properties.set(this, new Property(Channel.prototype, { channel }));
        properties.set(this, new Property(Address.prototype, { address }));
        properties.set(this, new Property(Priority.prototype, { priority }));
    }
    /**
     * @returns { String }
     */
    get Id() {
        const { Id } = properties.get(this, String.prototype);
        return Id;
    }
    /**
     * @returns { Channel }
    */
    get channel() {
        const { channel } = properties.get(this, Channel.prototype);
        return channel;
    }
    /**
     * @returns { Address }
    */
    get address() {
        const { address } = properties.get(this, Address.prototype);
        return address;
    }
    /**
     * @returns { Priority }
    */
    get priority() {
        const { priority } = properties.get(this, Priority.prototype);
        return priority;
    }
    /**
     * @returns { Message }
    */
    get message() {
        const { message } = properties.get(this, Message.prototype);
        return message;
    }
    /**
     * @param { Message } value
    */
    set message(value) {
        properties.set(this, new Property(Message.prototype, { message: value }));
    }
}