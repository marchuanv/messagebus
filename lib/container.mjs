import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
const containerFilePath = fileURLToPath(import.meta.url);

const privateBag = new WeakMap();
const _queue = [];
const _tasks = [];

async function handleQueues() {
    let _queueItem = _queue.shift();
    while (_queueItem) {
        const { args, stack, resolve, reject, callback } = _queueItem;
        const stackSplit = stack.split("\n");
        const vars = privateBag.get(args.context);
        vars.stack = stackSplit;
        try {
            const results = await callback(args);
            resolve(results);
        } catch (error) {
            error.stack = error.stack.concat(stack);
            console.log(error);
            reject(error);
        } finally {
            _queueItem = _queue.shift();
        }
    }
}

async function handleTasks() {
    let _taskItem = _tasks.shift();
    while (_taskItem) {
        const { resolve, callback, onceOff } = _taskItem;
        let results = null;
        try {
            results = await callback();
            if (!onceOff) {
                _tasks.push(_taskItem);
            }
        } catch (error) {
            console.error(error);
        } finally {
            _taskItem = _tasks.shift();
            resolve(results);
        }
    }
}

const getIntervalId = setInterval(async () => {
    if (_queue.length === 0) {
        return clearInterval(getIntervalId);
    }
    const locked = privateBag.get(Container);
    if (!locked) {
        try {
            privateBag.set(Container, true);
            await handleQueues();
            handleTasks();
        } catch (error) {
            throw error;
        } finally {
            privateBag.set(Container, false);
        }
    }
}, 1000);

class SafeLock { }
privateBag.set(SafeLock, false);
export class Container {
    constructor() {
        if (new.target === Container) {
            throw new TypeError(`${Container.name} must be extended`);
        }
        const Id = crypto.randomUUID();
        privateBag.set(this, { Id, lock: false });
        let callStack = (new Error()).stack.split("\n");
        callStack = callStack.filter(x => x.indexOf('at new Container (') === -1);
        queue({ context: this, type: this.constructor, callStack }, async ({ context, type, callStack }) => {
            for (const stack of callStack) {
                let regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
                let results = regEx.exec(stack);
                if (Array.isArray(results) && results.length > 0) {
                    const scriptPath = path.resolve(results[0]);
                    if (existsSync(scriptPath)) {
                        const relativePath = pathToFileURL(scriptPath);
                        if (containerFilePath !== scriptPath) {
                            const exported = await import(relativePath);
                            const typeNames = Object.keys(exported);
                            const types = typeNames.map(name => exported[name]);
                            if (types.find(t => t === type) || types.find(t => t === Object.getPrototypeOf(type))) {
                                const classes = getClassInfo(context);
                                context.import = { path: relativePath.toString(), classes, types };
                            }
                        }
                    }
                }
            }
            if (!context.import) {
                throw new Error('could not validate inheriting classes');
            }
        });
    }
    get Id() {
        const { Id } = privateBag.get(this) || {};
        return Id;
    }
    async task(callback, onceOff = true) {
        return this.promise((resolve) => {
            _tasks.push({ onceOff, callback, resolve });
        });
    }
    async safe(callback) {
        return this.promise((resolve) => {
            this.poll(async () => {
                const locked = privateBag.get(SafeLock);
                if (!locked) {
                    privateBag.set(SafeLock, true);
                    let results = null;
                    try {
                        results = await callback();
                    } catch (error) {
                        console.error(error);
                    } finally {
                        resolve(results);
                        privateBag.set(SafeLock, false);
                        return true;
                    }
                }
            });
        });
    }
    poll(callback) {
        const queueServiceId = setInterval(() => {
            setImmediate(async () => {
                if ((await callback.call(this))) {
                    clearInterval(queueServiceId);
                }
            });
        }, 1000);
    }
    promise(callback) {
        return new Promise(async (resolve, reject) => {
            await callback(resolve, reject);
        });
    }
    /**
     * @param { Object } prop
     */
    static async setProperty(ctx, prop) {
        return await queue({ context: ctx, prop }, async ({ context, prop }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            await validateCalledInClassContext(context);
            const propName = Object.keys(prop).reduce((x, key) => key);
            const propValue = prop[propName];
            vars[propName] = propValue;
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } instance
     * @param { T } type
     * @param { String? } namedInstance
     */
    static async setReference(ctx, instance, type, namedInstance = null) {
        return await queue({ context: ctx, instance, type, namedInstance }, async ({ context, instance, type, namedInstance }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            validateCalledInClassContext(context);
            const Id = instance.Id;
            if (Id) {
                vars[Id] = instance;
            } else if (namedInstance) {
                vars[namedInstance] = instance;
            } else {
                throw new Error('could not determine an Id or there is no named instance provided');
            }
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @param { String? } namedInstance
     * @returns { T }
     */
    static async getReference(ctx, type, namedInstance = null) {
        return await queue({ context: ctx, namedInstance, type }, async ({ context, type, namedInstance }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            await validateCalledInClassContext(context);
            if (namedInstance) {
                return vars[namedInstance];
            } else {
                for (const key of Object.keys(vars)) {
                    const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
                    let results = regexExp.exec(key);
                    if (Array.isArray(results) && results.length > 0) {
                        const instance = vars[key];
                        if (Object.getPrototypeOf(instance.constructor) === type.constructor) {
                            return instance;
                        }
                        if (Object.getPrototypeOf(instance) === type) {
                            return instance;
                        }
                    }
                }
            }
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { Object } propTemplate
     * @param { T } type
     * @returns { T }
     */
    static async getProperty(ctx, propTemplate, type) {
        return await queue({ context: ctx, propTemplate, type }, async ({ context, propTemplate, type }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            await validateCalledInClassContext(context);
            const propName = Object.keys(propTemplate).reduce((x, key) => key);
            const propValue = vars[propName];
            if (Object.getPrototypeOf(propValue) === type) {
                return propValue;
            }
        });
    }
    /**
     * @template T
     * @param { T } obj
     */
    static serialise(obj) {

    }
    /**
     * @template T
     * @param { String } data
     * @param { T } type
     * @returns { T }
     */
    static deserialise(data, type) {

    }
}
privateBag.set(Container, false);

function queue(args, callback) {
    const stack = (new Error()).stack;
    return new Promise(async (resolve, reject) => {
        _queue.push({ args, stack, resolve, reject, callback });
    });
}
function validateContainerClass(ctx) {
    if (!privateBag.has(ctx)) {
        throw new Error(`${ctx.constructor} does not extend the ${Container.name} class`);
    }
}
/**
 * @returns { Array<{ ctor: String, script: String }> }
 */
async function validateCalledInClassContext(context) {
    let vars = privateBag.get(context);
    let stack = vars.stack;
    stack.splice(0, 1);
    stack = stack.filter(x => x.indexOf('at new Promise (<anonymous>)') === -1);
    stack = stack.filter(x => x.indexOf('at validateCalledInClassContext (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getReference (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setReference (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setProperty (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getProperty (') === -1);
    stack = stack.filter(x => x.indexOf('at queue (') === -1);
    let foundClassInfo = await getClassInfoForStack(context, stack);
    if (!foundClassInfo) {
        throw new Error(`invalid callstack for ${context.constructor.name}`);
    }
}

async function getClassInfoForStack(context, stack, currentClassInfoIndex = -1, currentStackIndex = -1) {
    if (currentClassInfoIndex === -1) {
        currentClassInfoIndex = 0;
    }
    if (currentStackIndex === -1) {
        currentStackIndex = 0;
    }
    if (currentStackIndex === stack.length) {
        return null;
    }
    const currentClassInfo = context.import.classes[currentClassInfoIndex];
    const currentStack = stack[currentStackIndex];
    if (!currentClassInfo || !currentStack) {
        return null;
    }
    let foundClassInfo = null;
    if (stack[0].indexOf(context.import.path) > -1) {
        foundClassInfo = currentClassInfo;
        foundClassInfo.stack = currentStack;
    } else {
        let regEx = new RegExp(`at\\s+new\\s+${currentClassInfo.name}\\s+\\(`);
        let results = regEx.exec(currentStack);
        if (results && Array.isArray(results) && results.length > 0) {
            foundClassInfo = currentClassInfo;
            foundClassInfo.stack = currentStack;
        } else {
            for (const memberName of currentClassInfo.members) {
                let regEx = new RegExp(`at\\s+${currentClassInfo.name}.${memberName}\\s+\\(`);
                let results = regEx.exec(currentStack);
                if (Array.isArray(results) && results.length > 0) {
                    foundClassInfo = currentClassInfo;
                    foundClassInfo.stack = currentStack;
                    break;
                }
            }
        }
    }
    if (!foundClassInfo) {
        if (currentClassInfoIndex < context.import.classes.length) {
            currentClassInfoIndex = currentClassInfoIndex + 1;
        } else {
            currentClassInfoIndex = 0;
            if (currentStackIndex < stack.length) {
                currentStackIndex = currentStackIndex + 1;
            }
        }
        return await getClassInfoForStack(context, stack, currentClassInfoIndex, currentStackIndex);
    }
    return foundClassInfo;
}

function getClassInfo(ctx) {
    let _class = ctx.constructor;
    if (_class === Function) {
        _class = Object.getPrototypeOf(ctx);
    }
    let _className = _class.name;
    if (!_className) {
        return [];
    }
    let members = Object.getOwnPropertyNames(_class.prototype);
    const item = { Class: _class, name: _className, members };
    let items = [item];
    if (_class && _className) {
        const _items = getClassInfo(_class);
        for (const _item of _items) {
            item.members = item.members.concat(_item.members);
        }
        items = items.concat(_items);
    }
    return items;
}
