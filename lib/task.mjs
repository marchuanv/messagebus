import { Priority } from "./priority.mjs";
const privateBag = new WeakMap();

let tasks = [];
setInterval(() => {
    sortTasks();
    handleTask();
}, 100);
setInterval(() => {
    console.log(`task count: ${tasks.length}`);
}, 5000);

export class Task {
    /**
     * @param { class } context
     * @param {{ data: Object, priority: Priority, ignoreErrors: Boolean }} options
     * @returns { Task }
    */
    static create(context, options = null) {
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

        if (!privateBag.has(context)) {
            privateBag.set(context, {
                Id: context.Id,
                locked: false
            });
        }

        const task = new Task();
        task.name = context.constructor.name;
        task.Id = context.Id;
        privateBag.set(task, _options);

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
function sortTasks() {
    tasks = tasks.sort((x, y) => {
        const yVars = privateBag.get(y);
        const xVars = privateBag.get(x);
        let sortVal = 1;
        if (xVars.priority === Priority.High && yVars.priority !== Priority.High) {
            sortVal = -1;
        }
        return sortVal;
    });
}
async function handleTask() {
    const task = tasks.shift();
    if (task) {
        const vars = privateBag.get(task);
        const { instance, data, callback, state, ignoreErrors } = vars;
        let executed = false;
        let context = privateBag.get(instance);
        try {

            if (!state.ready) {
                tasks.push(task);
                return;
            }

            const { locked } = context;
            if (locked) {
                tasks.push(task);
                return;
            }
            context.locked = true;

            executed = true;
            const _results = await callback.call(task, instance, data);
            if ((_results !== undefined && _results !== null) && (vars.results === undefined || vars.results === null)) {
                vars.results = _results;
            }
            if (vars.results instanceof Error) {
                throw vars.results;
            }
        } catch (error) {
            if (ignoreErrors) {
                console.error(error);
            } else {
                throw error;
            }
        } finally {
            if (executed) {
                if (vars.results === null || vars.results === undefined) {
                    tasks.push(task);
                    context.locked = false;
                } else {
                    if (vars.resolve) {
                        privateBag.delete(task);
                        vars.resolve(vars.results);
                        context.locked = false;
                    } else {
                        console.error(new Error(`CRITICAL ERROR`));
                    }
                }
            }
        }
    }
}