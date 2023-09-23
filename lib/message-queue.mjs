import { Message } from './message.mjs';
const privateBag = new WeakMap();
class Queue {
    constructor() {
        privateBag.set(this, []);
    }
    /**
     * @param { Message } message
     */
    enqueue(message) {
        const queue = privateBag.get(this);
        return queue.push(message);
    }
    /**
     * @returns { Message } message
     */
    dequeue() {
        const queue = privateBag.get(this);
        return queue.shift();
    }
    /**
     * @returns { Number }
     */
    get length() {
        const { length } = privateBag.get(Queue);
        return length;
    }
}
export class PublisherMessageQueue extends Queue { };
