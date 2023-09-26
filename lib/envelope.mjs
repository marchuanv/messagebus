import crypto from 'node:crypto';
import { Properties } from '../lib/properties.mjs';
import { Message } from './message.mjs';
import { Priority } from './priority.mjs';
import { Channel } from './channel.mjs';
import { Address } from './address.mjs';
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
    get data() {
        return properties.get(this, Object.prototype, 'data');
    }
    /**
     * @param { Message } value
    */
    set data(value) {
        properties.set(this, Object.prototype, 'data', value);
    }
}