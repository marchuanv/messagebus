import crypto from 'node:crypto';
import { Properties } from '../lib/properties.mjs';
import { MessagePriority ,Message } from './message.mjs';
const properties = new Properties();
export class Address {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        properties.set(this, String.prototype, { hostName });
        properties.set(this, Number.prototype, { hostPort });
    }
    get hostname() {
        const { property } = properties.get(this, String.prototype, 'hostName');
        return property;
    }
}
export class Channel {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        properties.set(this, String.prototype, { name });
        properties.set(this, Address.prototype, { address });
    }
    get name() {
        const { property } = properties.get(this, String.prototype, 'name');
        return property;
    }
    get address() {
        const { property } = properties.get(this, Address.prototype, 'address');
        return property;
    }
}
export class Envelope {
    /**
     * @param { Channel } channel
     * @param { Address } address
     * @param { MessagePriority } messagePriority
     */
    constructor(channel, address, messagePriority) {
        properties.set(this, String.prototype, { Id: crypto.randomUUID() });
        properties.set(this, Channel.prototype, { channel });
        properties.set(this, Address.prototype, { address });
        properties.set(this, MessagePriority.prototype, { messagePriority });
    }
    /**
     * @returns { String }
     */
    get Id() {
        const { property } = properties.get(this, String.prototype, 'Id');
        return property;
    }
    /**
     * @returns { Channel }
    */
    get channel() {
        const { property } = properties.get(this, Channel.prototype, 'channel');
        return property;
    }
    /**
     * @returns { Address }
    */
    get address() {
        const { property } = properties.get(this, Address.prototype, 'address');
        return property;
    }
    /**
     * @returns { Priority }
    */
    get messagePriority() {
        const { property } = properties.get(this, MessagePriority.prototype, 'messagePriority');
        return property;
    }
    /**
     * @returns { Message }
    */
    get message() {
        const { property } = properties.get(this, Message.prototype, 'message');
        return property;
    }
    /**
     * @param { Message } value
    */
    set message(value) {
        properties.set(this, Message.prototype, { message: value });
    }
}