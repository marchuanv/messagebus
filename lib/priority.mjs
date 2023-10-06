import crypto from 'node:crypto';
const Id = crypto.randomUUID();
const privateBag = new WeakMap();
export class Priority {
    constructor(value) {
        privateBag.set(this, { Id, value });
    }
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    get value() {
        const { value } = privateBag.get(this);
        return value;
    }
    static get High() {
        return highPriority;
    }
    static get Medium() {
        return mediumPriority;
    }
    static get Low() {
        return lowPriority;
    }
    static get All() {
        return [
            Priority.High,
            Priority.Medium,
            Priority.Low
        ];
    }
}
export class HighPriority extends Priority { constructor() { super(1); } }
export class MediumPriority extends Priority { constructor() { super(2); } }
export class LowPriority extends Priority { constructor() { super(3); } }
const highPriority = new HighPriority();
const mediumPriority = new MediumPriority();
const lowPriority = new LowPriority();