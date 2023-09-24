import { Properties, Property } from '../lib/properties.mjs'
import crypto from 'node:crypto';
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
        const property = properties.get(this, String.prototype, { hostname });
        return property.value;
    }
}
export class Channel {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        properties.set(this, new Property(String.prototype, { name }));
        properties.set(this, new Property(Address.prototype, { name: 'address', value: address }));
    }
    get name() {
        return properties.get(this, String.prototype, 'name');
    }
    get address() {
        return properties.get(this, Address.prototype, 'address');
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
        properties.set(this, new Property(String.prototype, { name: 'Id', value: crypto.randomUUID() }));
        properties.set(this, new Property(Channel.prototype, { name: 'channel', value: channel }));
        properties.set(this, new Property(Address.prototype, { name: 'address', value: address }));
        properties.set(this, new Property(Priority.prototype, { name: 'priority', value: priority }));
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { Channel }
    */
    get channel() {
        return properties.get(this, Channel.prototype, 'channel');
    }
    /**
     * @returns { Address }
    */
    get address() {
        return properties.get(this, Address.prototype, 'address');
    }
    /**
     * @returns { Priority }
    */
    get priority() {
        return properties.get(this, Priority.prototype, 'priority');
    }
    /**
     * @returns { Message }
    */
    get message() {
        return properties.get(this, Message.prototype, 'message');
    }
    /**
     * @param { Message } value
    */
    set message(value) {
        properties.set(this, new Property(Priority.prototype, { name: 'message', value }));
    }
}