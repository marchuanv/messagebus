import crypto from 'node:crypto';
import { Properties } from '../lib/properties.mjs';
import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Message } from './message.mjs';
import { Priority } from './priority.mjs';
const properties = new Properties();
export class Envelope {
    /**
     * @param { Channel } channel
     * @param { Address } address
     * @param { Priority } priority
     */
    constructor(channel, address, priority) {
        properties.set(this, String.prototype, 'Id', crypto.randomUUID());
        properties.set(this, Channel.prototype, 'channel', channel);
        properties.set(this, Address.prototype, 'address', address);
        properties.set(this, Priority.prototype, 'priority', priority);
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
        properties.set(this, Message.prototype, 'message', value);
    }
}