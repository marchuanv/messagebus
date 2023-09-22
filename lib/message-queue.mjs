import { Message } from './message.mjs';
const privateBag = new WeakMap();
class Queue {
    /**
     * @param { Message } message
     */
    enqueue(message) {
        const { queue } = privateBag.get(this);
        return queue.push(message);
    }
    /**
     * @returns { Message } message
     */
    dequeue() {
        const { queue } = privateBag.get(this);
        return queue.shift();
    }
    get length() {
        const { length } = privateBag.get(this);
        return length;
    }
}
export class MessageQueue {
    /**
     * @returns { Message }
    */
    static async dequeue() {
        const queue = privateBag.get(Queue);
        return queue.dequeue();
    }
    /**
     * push at message to the end of the queue
     * @param { Message } message
     * @returns { Boolean }
    */
    static async enqueue(message) {
        const queue = privateBag.get(Queue);
        queue.enqueue(message);
    }
};
const queue = new Queue();
privateBag.set(Queue, queue);
privateBag.set(queue, []);