import { Priority } from "./priority.mjs";
import { Task } from './task.mjs';
const privateBag = new WeakMap();
// setInterval(() => {
//     handleTask();
// }, 100);
// setInterval(() => {
//     console.log(`task count: ${tasks.length}`);
// }, 5000);
export class TaskQueue {
    constructor() {
        const queues = { };
        for(const priority of Priority.All) {
            queues[priority] = [];
        };
        privateBag.set(this, queues);
    }
    /**
     * @param { Task } task
    */
    enqueue(task) {
        const queues = privateBag.get(this);
        const queue = queues[task.priority];
        queue.push(task);
    }
    /**
     * @param { Priority } priority 
     * @returns { Task } 
    */
    dequeue(priority) {
        return queue[priority].shift();
    }
}