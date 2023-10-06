import crypto from 'node:crypto';
import { Priority } from "./priority.mjs";
import { TaskState } from './task-state.mjs';
const privateBag = new WeakMap();
let tasks = [];
setInterval(() => {
    handleTask();
}, 100);
setInterval(() => {
    console.log(`task count: ${tasks.length}`);
}, 5000);
export class Task {
    /**
     * @param { Strng } name,
     * @param { class } context
     * @param {{ data: Object, priority: Priority, ignoreErrors: Boolean, logRunning: Boolean }} options
     * @returns { Task }
    */
    static create(name, context, options = null) {
        const _options = {
            data: null,
            priority: Priority.Low,
            ignoreErrors: false,
            callback: null,
            results: null,
            resolve: null,
            instance: context,
            logRunning: false
        };
        if (options) {
            Object.assign(_options, options);
        }
        const task = new Task();
        task.name = `${context.constructor.name}_${name}`;
        task.context = context.Id;
        task.logRunning = _options.logRunning;
        privateBag.set(task, _options);
        task.state = TaskState.Queued;
        task.error = null;
        task.blockCount = 0;
        task.Id = crypto.randomUUID();
        const hrtime = process.hrtime();
        let nanoSeconds = (hrtime[0] * 1e9) + hrtime[1];
        task.time = nanoSeconds;
        task.priority = _options.priority;
        task.dependencies = [];
        return task;
    }
    /**
    * @param { T } type
    * @param { Function } callback
    * @returns { Promise<T> }
    */
    queue(type, callback) {

        //get the same tasks but executed in a different context
        const matchingTaskInDifferentContext = tasks.find(x => x.name === this.name && x.context !== this.context);
        const matchingTaskInSameContext = tasks.find(x => x.name === this.name && x.context === this.context && x.Id !== this.Id);
        const isRequeue = (this.state === TaskState.ExecutionCompleted);
        const isBlocked = (this.state === TaskState.Blocked);
        if (matchingTaskInDifferentContext || matchingTaskInSameContext || isRequeue || isBlocked) {
            this.dependencies.push(matchingTaskInDifferentContext);
            this.dependencies.push(matchingTaskInSameContext);
            this.dependencies = this.dependencies.filter(d => d);
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
        return new Promise((resolve) => {
            const vars = privateBag.get(this);
            if (!vars.callback) {
                if (callback) {
                    vars.callback = callback;
                } else {
                    throw new Error('callback argument was not provided');
                }
            }
            if (!vars.resolve) {
                vars.resolve = resolve;
            }
            this.state = TaskState.Ready;
        });
    }
    /**
     * @param { Object }
    */
    set results(value) {
        const vars = privateBag.get(this);
        vars.results = value;
    }
}
/**
 * @param { Task } _task
 */
async function handleTask() {
    let task = tasks.shift();
    if (!task) {
        return;
    }
    const completedDependantTaskCount = task.dependencies.filter(td => 
        td.state === TaskState.Done &&
        !td.logRunning
    ).length;
    const totalDependantTaskCount = task.dependencies.filter(td => !td.logRunning).length;
    if (completedDependantTaskCount !== totalDependantTaskCount) { //are all the dependencies finished?
        task.state = TaskState.Blocked
        console.log(`${task.context}: ${task.name}(${task.Id}) is blocked`);
    } else if (task.state === TaskState.Ready) {
        task.state = TaskState.Locked;
        const vars = privateBag.get(task);
        const {
            instance,
            data,
            callback,
            ignoreErrors
        } = vars;
        try {
            task.state = TaskState.ExecutionStarted;
            const _results = await callback.call(task, instance, data);
            if ((_results !== undefined && _results !== null) && (vars.results === undefined || vars.results === null)) {
                vars.results = _results;
            }
            task.state = TaskState.ExecutionCompleted;
            if (vars.results instanceof Error) {
                throw vars.results;
            }
        } catch (error) {
            task.state = TaskState.Error;
            task.error = error;
        } finally {
            if (task.state === TaskState.ExecutionCompleted) {
                if (vars.results === null || vars.results === undefined) {
                    task.queue();
                    console.log(`${task.context}: requeued ${task.name}(${task.Id}) task`);
                } else {
                    console.log(`${task.context}: handled ${task.name}(${task.Id}) task`);
                    task.state = TaskState.Done;
                    if (vars.resolve) {
                        privateBag.delete(task);
                        vars.resolve(vars.results);
                    } else {
                        throw new Error(`CRITICAL ERROR`);
                    }
                }
            } else if (task.state === TaskState.Error) {
                console.log(`${task.context}: error handling ${task.name}(${task.Id}) task`);
                if (ignoreErrors) {
                    console.error(task.error);
                } else {
                    throw new Error(task.error);
                }
            } else {
                throw new Error('unhandled task state');
            }
        }
    } else {
        task.queue();
    }
}