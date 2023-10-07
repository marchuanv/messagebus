import crypto from 'node:crypto';
import { Priority } from "./priority.mjs";
import { TaskState } from './task-state.mjs';
const loopIntervalMilli = 100;
const queueMilli = 100;
const criteriaLongRunningMilli = 1000;
const privateBag = new WeakMap();
let tasks = [];
let taskErrors = [];

const taskLoop = setInterval(() => {
    let task = tasks.shift();
    if (task) {
        handleTask(task);
    }
}, loopIntervalMilli);
setInterval(() => {
    console.log('');
    console.log('Loop Info:');
    console.log(`- Task Count: ${tasks.length}`);
    console.log(`- Long Running Task Count: ${tasks.filter(t => t.state === TaskState.LongRunning).length}`);
    if (taskErrors.length > 0) {
        console.log(`- Task Errors:`);
        for (const taskError of taskErrors) {
            console.error(taskError.error);
        }
    }
    console.log('');
}, 5000);
export class Task {
    /**
     * @param { Strng } name,
     * @param { class } context
     * @param {{ data: Object, priority: Priority, ignoreErrors: Boolean, onceOff: Boolean }} options
     * @returns { Task }
    */
    static create(name, context, options = {}) {
        const task = new Task();
        task.name = `${context.constructor.name}_${name}`;
        task.context = context.Id;
        task.onceOff = options.onceOff || true;
        task.instance = context;
        task.error = null;
        task.callback = null;
        task.ignoreErrors = options.ignoreErrors || false;
        task.data = options.data || null;
        task.blockCount = 0;
        task.Id = crypto.randomUUID();
        task.time = 0;
        task.priority = options.priority | Priority.Low;
        task.dependencies = [];
        return task;
    }
    /**
    * @param { T } type
    * @param { Function } callback
    * @returns { Promise<T> }
    */
    queue(type, callback) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const isRequeue = (this.state && (this.state !== TaskState.Ready && this.state !== TaskState.Queued));

                this.state = TaskState.Queued;

                this.time = this.time + queueMilli;

                if (this.time > criteriaLongRunningMilli) {
                    this.state = TaskState.LongRunning;
                }

                //get the same tasks but executed in a different context
                const matchingTaskInDifferentContext = tasks.find(x => x.name === this.name && x.context !== this.context);
                const matchingTaskInSameContext = tasks.find(x => x.name === this.name && x.context === this.context && x.Id !== this.Id);
                if ((matchingTaskInDifferentContext || matchingTaskInSameContext) && !isRequeue) {
                    this.dependencies.push(matchingTaskInDifferentContext);
                    this.dependencies.push(matchingTaskInSameContext);
                    this.dependencies = this.dependencies.filter(d => d);
                    this.dependencies = new Set(this.dependencies);
                    this.dependencies = [...this.dependencies];
                    tasks.push(this);
                } else if (isRequeue || this.state === TaskState.LongRunning) {
                    tasks.push(this);
                } else {
                    tasks.unshift(this);
                }
                tasks = tasks.sort((a, b) => {
                    if (a.priority.value === b.priority.value) {
                        return 0;
                    }
                    if (a.priority.value > b.priority.value) {
                        return 1;
                    }
                    if (a.priority.value < b.priority.value) {
                        return -1;
                    }
                });
                if (!this.callback) {
                    if (callback) {
                        this.callback = callback;
                    } else {
                        throw new Error('callback argument was not provided');
                    }
                }
                if (!this.resolve) {
                    this.resolve = resolve;
                }
                this.state = TaskState.Ready;
            }, queueMilli);
        });
    }
    /**
     * @param { Object }
    */
    set results(value) {
        if (this.resolve) {
            this.resolve(value);
            this.state = TaskState.PromiseResolved;
            console.log(`${this.context}: handled ${this.name}(${this.Id}) task`);
        } else {
            clearInterval(taskLoop);
            throw new Error(`CRITICAL ERROR`);
        }
    }
}
/**
 * @param { Task } task
 */
async function handleTask(task) {
    const doneDependantTaskCount = task.dependencies.filter(td => td.state === TaskState.Done && td.state !== TaskState.LongRunning).length;
    const totalDependantTaskCount = task.dependencies.filter(td => td.state !== TaskState.LongRunning).length;
    if (doneDependantTaskCount !== totalDependantTaskCount) { //are all the dependencies finished?
        task.queue();
    } else if (task.state === TaskState.Ready) {
        try {
            task.state = TaskState.CallbackStarted;
            const _results = await task.callback.call(task, task.instance, task.data);
            task.state = TaskState.CallbackCompleted;
            if ((_results !== undefined && _results !== null) && (task.results === undefined || task.results === null)) {
                task.results = _results;
            }
        } catch (error) {
            task.state = TaskState.Error;
            task.error = error;
        } finally {
            switch (task.state) {
                case TaskState.PromiseResolved: {
                    task.state = TaskState.Done;
                    break;
                }
                case TaskState.CallbackCompleted: {
                    const waitForPromise = setInterval(() => {
                        if (task.state === TaskState.PromiseResolved) {
                            task.state = TaskState.Done;
                            clearInterval(waitForPromise);
                        } else if (!task.onceOff) {
                            clearInterval(waitForPromise);
                            task.queue();
                        }
                    }, queueMilli);
                    break;
                }
                case TaskState.Error: {
                    console.log(`${task.context}: error handling ${task.name}(${task.Id}) task`);
                    taskErrors.push(task);
                    if (task.ignoreErrors) {
                        console.error(task.error);
                    } else {
                        clearInterval(taskLoop);
                    }
                    break;
                }
                default: {
                    clearInterval(taskLoop);
                    task.error = new Error('unhandled state');
                    taskErrors.push(task);
                    break;
                }
            }
        }
    } else {
        task.queue();
    }
}