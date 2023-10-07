import crypto from 'node:crypto';
import { Priority } from "./priority.mjs";
import { TaskState } from './task-state.mjs';
const loopIntervalMilli = 100;
const criteriaLongRunningMilli = 60000;
const privateBag = new WeakMap();
let tasks = [];

setInterval(() => {
    let task = tasks.shift();
    if (task) {
        handleTask(task);
    }
}, loopIntervalMilli);
setInterval(() => {
    console.log(`task count: ${tasks.length}`);
}, 5000);
export class Task {
    /**
     * @param { Strng } name,
     * @param { class } context
     * @param {{ data: Object, priority: Priority, ignoreErrors: Boolean, onceOff: Boolean }} options
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
            onceOff: true
        };
        if (options) {
            Object.assign(_options, options);
        }
        const task = new Task();
        task.name = `${context.constructor.name}_${name}`;
        task.context = context.Id;
        task.queueCount = 0;
        privateBag.set(task, _options);
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

        const isRequeue = (this.state && (this.state !== TaskState.Ready && this.state !== TaskState.Queued));

        this.state = TaskState.Queued;

        this.queueCount = this.queueCount + 1;

        const taskStartTimeMilli = parseNano(this.time);
      
        const hrtime = process.hrtime();
        const currentTimeNanoseconds = (hrtime[0] * 1e9) + hrtime[1];

        const taskCurrentTimeMilli = parseNano(currentTimeNanoseconds);

        if ( (taskCurrentTimeMilli - taskStartTimeMilli) > criteriaLongRunningMilli){
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
        if (vars.resolve) {
            privateBag.delete(this);
            vars.resolve(vars.results);
            this.state = TaskState.PromiseResolved;
            console.log(`${this.context}: handled ${this.name}(${this.Id}) task`);
        } else {
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
        setTimeout(() => {
            task.queue();
        },1000);
    } else if (task.state === TaskState.Ready) {
        task.state = TaskState.Locked;
        const vars = privateBag.get(task);
        const {
            instance,
            data,
            callback,
            ignoreErrors,
            onceOff
        } = vars;
        try {

            task.state = TaskState.CallbackStarted;
            const _results = await callback.call(task, instance, data);
            task.state = TaskState.CallbackCompleted;

            if ((_results !== undefined && _results !== null) && (vars.results === undefined || vars.results === null)) {
                task.results = _results;
            }

            if (vars.results instanceof Error) {
                throw vars.results;
            }

        } catch (error) {
            task.state = TaskState.Error;
            task.error = error;
        } finally {
            switch(task.state) {
                case TaskState.PromiseResolved: {
                    task.state = TaskState.Done;
                    break;
                }
                case TaskState.CallbackCompleted: {
                    const waitForPromise = setInterval(() => {
                        if (task.state === TaskState.PromiseResolved) {
                            task.state = TaskState.Done;
                            clearInterval(waitForPromise);
                        } else if (!onceOff) {
                            clearInterval(waitForPromise);
                            task.queue();
                        }
                    }, 200);
                    break;
                }
                case TaskState.Error: {
                    console.log(`${task.context}: error handling ${task.name}(${task.Id}) task`);
                    if (ignoreErrors) {
                        console.error(task.error);
                    } else {
                        throw new Error(task.error);
                    }
                    break;
                }
                default: {
                    throw new Error('unhandled state');
                }
            }
        }
    } else {
        task.queue();
    }
}

function parseNano(nano) {
    var hour = Math.floor(nano / 3600000000000);
    var temp = nano % 3600000000000;
    var minute = Math.floor(temp / 60000000000);
    var temp2 = temp % 60000000000;
    var second = Math.floor(temp2 / 1000000000);
    var mil = temp2 % 1000000000;
    hour = hour.toString();
    minute = minute.toString();
    second = second.toString();
    return mil.toString().slice(0, 3) //cuts off insignificant digits
  }