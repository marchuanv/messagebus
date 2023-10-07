import crypto from 'node:crypto';
import { Priority } from "./priority.mjs";
import { HandleErrorsTaskFlag, TaskFlag } from "./task-flag.mjs";
import { TaskState } from './task-state.mjs';
const loopIntervalMilli = 100;
const queueMilli = 100;
const criteriaLongRunningMilli = 1000;
let tasks = [];
let taskErrors = [];

const taskLoop = setInterval(() => {
    let task = tasks.shift();
    if (task) {
        handleTask(task);
    }
}, loopIntervalMilli);
const loggingLoop = setInterval(() => {
    console.log('');
    console.log('Loop Info:');
    console.log(`- Task Count: ${tasks.length}`);
    console.log(`- Long Running Task Count: ${tasks.filter(t => t.state === TaskState.LongRunning).length}`);
    if (taskErrors.length > 0) {
        console.log(`- Task Errors:`);
        for (const task of taskErrors) {
            console.error(task.error);
            console.error(task.stack);
        }
        clearInterval(loggingLoop);
        process.exit(1);
    }
    console.log('');
}, 5000);

export class Task {
    /**
     * @param { Strng } name,
     * @param { class } context
     * @param { Array<TaskFlag> } flags
     * @returns { Task }
    */
    static create(name, context, data, flags = []) {
        const task = new Task();
        task.name = `${context.constructor.name}_${name}`;
        task.context = context.Id;
        task.flags = flags;
        task.onceOff = (options.onceOff == undefined || options.onceOff === null) ? true: options.onceOff;
        task.instance = context;
        task.error = null;
        task.waitForResults = (options.block == undefined || options.block === null) ? false: options.block;
        task.callback = null;
        task.ignoreErrors = (options.ignoreErrors == undefined || options.ignoreErrors === null) ? false: options.ignoreErrors;
        task.data = data;
        task.Id = crypto.randomUUID();
        task.time = 0;
        task.priority = (options.priority == undefined || options.priority === null) ?  Priority.Low: options.priority;
        task.dependencies = [];
        task.stack = (new Error()).stack;
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
    complete(value) {
        if (this.resolve) {
            this.value = value;
            this.resolve(this.value);
            this.state = TaskState.PromiseResolved;
            console.log(`${this.context}: handled ${this.name}(${this.Id}) task`);
        } else {
            clearInterval(taskLoop);
            this.error = new Error(`critical error setting results`);
            taskErrors.push(this);
        }
    }
    /**
     * @param { TaskFlag } flag
     * @returns { Boolean }
     */
    hasFlag(flag) {
        for (const _flag of task.flags) {
            if (flag === _flag) {
                return true;
            }
        }
        return false;
    }
}
/**
 * @param { Task } task
 */
async function handleTask(task) {
    const doneDependantTaskCount = task.dependencies.filter(td => td.state === TaskState.Done && td.state !== TaskState.LongRunning).length;
    const totalDependantTaskCount = task.dependencies.filter(td => td.state !== TaskState.LongRunning).length;
    let isResultsSet = false;
    if (task.name === 'ChannelMessageQueue_shift') {
        debugger;
    }
    if (doneDependantTaskCount !== totalDependantTaskCount) { //are all the dependencies finished?
        task.queue();
    } else if (task.state === TaskState.Ready) {
        try {
            task.state = TaskState.CallbackStarted;
            await task.callback.call(task, task.instance, task.data);
            task.state = TaskState.CallbackCompleted;
            if (task.state !== TaskState.PromiseResolved) {
                task.state = TaskState.PromiseResolvedNoResults;
            }
        } catch (error) {
            console.log(`${task.context}: ${task.name}(${task.Id}) task error`);
            task.state = TaskState.Error;
            task.error = error;
        } finally {
            switch (task.state) {
                case TaskState.PromiseResolved: {
                    task.state = TaskState.Done;
                    if (task.hasFlag(TaskFlag.Repeat)) {
                        task.queue();
                    } else if (task.hasFlag(TaskFlag.OnceOff)) {
                        //nothing for now
                    } else {
                        task.error = new Error(`unable to handle state: ${TaskState.PromiseResolved.constructor.name}`);
                        clearInterval(taskLoop);
                        taskErrors.push(task);
                    }
                    break;
                }
                case TaskState.PromiseResolvedNoResults: {
                    task.state = TaskState.Done;
                    if (task.hasFlag(TaskFlag.WaitForValidResponse)) {
                        task.queue();
                    } else if (task.hasFlag(TaskFlag.OnceOff)) {
                        //nothing for now
                    } else {
                        task.error = new Error(`unable to handle state: ${TaskState.PromiseResolved.constructor.name}`);
                        clearInterval(taskLoop);
                        taskErrors.push(task);
                    }
                    break;
                }
                case TaskState.CallbackCompleted: {
                    break;
                }
                case TaskState.Error: {
                    if (task.hasFlag(TaskFlag.HandleErrors)) {
                        clearInterval(taskLoop);
                    } else if (task.hasFlag(TaskFlag.IgnoreErrors)) {
                        console.error(task.error);
                    } else {
                        task.error = new Error(`unable to handle task error`);
                        clearInterval(taskLoop);
                    }
                    taskErrors.push(task);
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