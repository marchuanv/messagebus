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
     * @param {{ data: Object, priority: Priority, ignoreErrors: Boolean }} options
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
            instance: context
        };
        if (options) {
            Object.assign(_options, options);
        }
        const task = new Task();
        task.name = `${context.constructor.name}_${name}`;
        task.context = context.Id;
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
        //get the same tasks but executed in a different context
        const matchingTaskInDifferentContext = tasks.find(x => x.name === task.name && x.context !== task.context);
        const matchingTaskInSameContext = tasks.find(x => x.name === task.name && x.context === task.context && x.Id !== task.Id);
        if (matchingTaskInDifferentContext || matchingTaskInSameContext) {
            task.dependencies.push(matchingTaskInDifferentContext);
            task.dependencies.push(matchingTaskInSameContext);
            task.dependencies = task.dependencies.filter(d => d);
            tasks.push(task);
        } else {
            tasks.unshift(task);
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
        return task;
    }
    /**
    * @template T
    * @param { T } type
    * @param { Function } callback
    * @returns { Promise<T> }
    */
    run(type, callback) {
        if (!callback) {
            throw new Error('callback argument was not provided');
        }
        return new Promise((resolve) => {
            const vars = privateBag.get(this);
            vars.callback = callback;
            vars.resolve = resolve;
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
async function handleTask() {
    let task = tasks.shift();
    if (!task) {
        return;
    }
    if (task.dependencies.filter(td => td.state === TaskState.Done).length !== task.dependencies.length) { //are all the dependencies finished?
        console.log();
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
                console.log(`${task.context}: handled ${task.name}(${task.Id}) task`);
                if (vars.results === null || vars.results === undefined) {
                    task.state = TaskState.Ready;
                    tasks.push(task);
                } else {
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
        tasks.push(task);
    }
}