const privateBag = new WeakMap();

import crypto from 'node:crypto';

export class Address { }
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
     * @param { Address } address
     * @param { Priority } priority
     */
    constructor(address, priority) {
        const properties = { id: crypto.randomUUID(), address, priority };
        if (address instanceof Address) {
            throw new Error('invalid address argument');
        }
        if (!(priority instanceof Priority)) {
            throw new Error('invalid priority argument');
        }
        privateBag.set(this, properties);
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    get address() {
        const { address } = privateBag.get(this);
        return address;
    }
    get priority() {
        const { priority } = privateBag.get(this);
        return priority;
    }
}