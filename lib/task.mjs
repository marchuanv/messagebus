import crypto from 'node:crypto';
import { Priority } from "./priority.mjs";
const privateBag = new WeakMap();
const tasks = [];
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
            state: { ready: false },
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

        task.status = 1;
        task.Id = crypto.randomUUID();
        const hrtime = process.hrtime();
        let nanoSeconds = (hrtime[0] * 1e9) + hrtime[1];
        task.priority = nanoSeconds;
        if (privateBag.has(context)) {
            privateBag.get(context).push(task);
            const _groupTasks = privateBag.get(context).sort((a, b) => (BigInt(a.priority) < BigInt(b.priority)) ? -1 : 1);
            privateBag.set(context, _groupTasks);
            task.parent = _groupTasks[0];
        } else {
            privateBag.set(context, [task]);
        }
        tasks.push(task);
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
            vars.state.ready = true;
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
    let executed = false;
    let task = tasks.shift();
    if (task) {
        const vars = privateBag.get(task);
        const {
            instance,
            data,
            callback,
            state,
            ignoreErrors
        } = vars;
        let group = privateBag.get(instance);
        const busy = group.find(x => x.status > 1 && x.status < 6);
        if (busy) {
            tasks.push(task);
            return;
        }

        task = group.shift();
        while (task) {
            if (task.parent && (task.parent.status > 1 && task.parent.status < 6)) {
                tasks.push(task);
            } else {
                group.unshift(task);
                break;
            }
            task = group.shift();
        }

        try {
            if (!state.ready) {
                tasks.push(task);
                return;
            }
            executed = true;
            task.status = 2;
            const _results = await callback.call(task, instance, data);
            if ((_results !== undefined && _results !== null) && (vars.results === undefined || vars.results === null)) {
                vars.results = _results;
            }
            task.status = 3;
            if (vars.results instanceof Error) {
                throw vars.results;
            }
        } catch (error) {
            if (ignoreErrors) {
                console.error(error);
            } else {
                task.status = 4;
                throw error;
            }
        } finally {
            if (executed) {
                if (vars.results === null || vars.results === undefined) {
                    task.status = 5;
                    tasks.push(task);
                } else {
                    if (vars.resolve) {
                        task.status = 6;
                        privateBag.delete(task);
                        vars.resolve(vars.results);
                    } else {
                        console.error(new Error(`CRITICAL ERROR`));
                    }
                }
            }
            const index = group.findIndex(t => t.status === 6);
            group.splice(index, 1);
        }
    }
}