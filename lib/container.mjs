import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Priority } from './priority.mjs';
import { Task } from './task.mjs';

const containerFilePath = fileURLToPath(import.meta.url);
const privateBag = new WeakMap();

export class Container {
    constructor() {
        if (new.target === Container) {
            throw new TypeError(`${Container.name} must be extended`);
        }
        const Id = crypto.randomUUID();
        privateBag.set(this, { Id, lock: false });
        let callStack = (new Error()).stack.split("\n");
        callStack = callStack.filter(x => x.indexOf('at new Container (') === -1);
        Task.create('container', this, { data: callStack, priority: Priority.High }).queue(null, async function (instance, callStack) {
            const classInfo = await getClassInfoForStack(instance, callStack);
            instance.import = classInfo;
            if (instance.import) {
                return true;
            } else {
                return new Error('could not validate inheriting classes');
            }
        });
    }
    /**
     * @returns { String }
     */
    get Id() {
        const { Id } = privateBag.get(this) || {};
        return Id;
    }
    /**
    * @param { String } value
    */
    set Id(value) {
        const vars = privateBag.get(this);
        vars.Id = value;
    }
    /**
     * @param { Object } prop
    */
    setProperty(prop) {
        const vars = privateBag.get(this);
        vars.stack = (new Error()).stack;
        return Task.create('setProperty', this, { data: prop, priority: Priority.Medium }).queue(null, async function (instance, prop) {
            const vars = privateBag.get(instance);
            validateContainerClass(instance);
            await validateCalledInClassContext(instance);
            const propName = Object.keys(prop).reduce((x, key) => key);
            const propValue = prop[propName];
            vars[propName] = propValue;
            return true;
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } instance
     * @param { T } type
     * @param { String? } namedInstance
     */
    setReference(depInstance, type, namedInstance = null) {
        const vars = privateBag.get(this);
        vars.stack = (new Error()).stack;
        return Task.create('setReference', this, { data: { depInstance, namedInstance }, priority: Priority.Medium }).queue(null, async function (instance, { depInstance, namedInstance }) {
            const vars = privateBag.get(instance);
            validateContainerClass(instance);
            validateCalledInClassContext(instance);
            const Id = depInstance.Id;
            if (Id) {
                vars[Id] = depInstance;
                return true;
            } else if (namedInstance) {
                vars[namedInstance] = depInstance;
                return true;
            } else {
                return new Error('could not determine an Id or there is no named instance provided');
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
    getReference(type, namedInstance = null) {
        const vars = privateBag.get(this);
        vars.stack = (new Error()).stack;
        return Task.create('getReference', this, { data: { type, namedInstance } }).queue(type, async function (instance, { type, namedInstance }) {
            const vars = privateBag.get(instance);
            validateContainerClass(instance);
            await validateCalledInClassContext(instance);
            if (namedInstance) {
                return vars[namedInstance];
            } else {
                const instances = Object.keys(vars)
                    .filter(key => /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(key))
                    .map(key => vars[key]);
                for (const instance of instances) {
                    if (Object.getPrototypeOf(instance.constructor) === type.constructor) {
                        return instance;
                    } else if (Object.getPrototypeOf(instance) === type) {
                        return instance;
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
    getProperty(propTemplate, type) {
        const vars = privateBag.get(this);
        vars.stack = (new Error()).stack;
        return Task.create('getProperty', this, { data: { propTemplate, type }, priority: Priority.Low }).queue(type, async function (instance, { propTemplate, type }) {
            const vars = privateBag.get(instance);
            validateContainerClass(instance);
            await validateCalledInClassContext(instance);
            const propName = Object.keys(propTemplate).reduce((x, key) => key);
            const propValue = vars[propName];
            if (Object.getPrototypeOf(propValue) === type) {
                return propValue;
            }
        });
    }
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
    let stack = vars.stack.split("\n");
    let foundClassInfo = await getClassInfoForStack(context, stack);
    if (!foundClassInfo) {
        throw new Error(`invalid callstack for ${context.constructor.name}`);
    }
}
async function getClassInfoForStack(context, stack, currentClassInfoIndex = -1, currentStackIndex = -1) {

    let clonedStack = JSON.parse(JSON.stringify(stack));
    clonedStack.splice(0, 1);
    clonedStack = clonedStack.filter(x => x.indexOf('at new Promise (<anonymous>)') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at validateCalledInClassContext (file:///C:/github/messagebus/lib/container.mjs') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at Function.getReference (') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at Function.setReference (') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at Function.setProperty (') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at Function.getProperty (') === -1);
    clonedStack = clonedStack.filter(x => x.indexOf('at queue (') === -1);

    if (currentClassInfoIndex === -1) {
        currentClassInfoIndex = 0;
    }
    if (currentStackIndex === -1) {
        currentStackIndex = 0;
    }
    if (currentStackIndex === clonedStack.length) {
        return null;
    }
    const currentStack = clonedStack[currentStackIndex];
    if (context.import) {
        let foundClassInfo = null;
        const currentClassInfo = context.import.classes[currentClassInfoIndex];
        if (!currentClassInfo || !currentStack) {
            return null;
        }
        if (clonedStack[0].indexOf(context.import.path) > -1) {
            foundClassInfo = currentClassInfo;
            foundClassInfo.clonedStack = currentStack;
        } else {
            for (const memberName of currentClassInfo.members) {
                let regEx = new RegExp(`at\\s+${currentClassInfo.name}.${memberName}\\s+\\(`);
                let results = regEx.exec(currentStack);
                if (Array.isArray(results) && results.length > 0) {
                    foundClassInfo = currentClassInfo;
                    foundClassInfo.clonedStack = currentStack;
                    break;
                }
            }
        }
        if (!foundClassInfo) {
            if (currentClassInfoIndex < context.import.classes.length) {
                currentClassInfoIndex = currentClassInfoIndex + 1;
            } else {
                currentClassInfoIndex = 0;
                if (currentStackIndex < clonedStack.length) {
                    currentStackIndex = currentStackIndex + 1;
                }
            }
            return await getClassInfoForStack(context, clonedStack, currentClassInfoIndex, currentStackIndex);
        }
    } else {
        let regEx = new RegExp(`at\\s+new\\s+[a-zA-Z0-9]+\\s+\\(`);
        let results = regEx.exec(currentStack);
        if (results && Array.isArray(results) && results.length > 0) {
            let regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
            let results = regEx.exec(currentStack);
            if (Array.isArray(results) && results.length > 0) {
                const scriptPath = path.resolve(results[0]);
                if (existsSync(scriptPath)) {
                    const relativePath = pathToFileURL(scriptPath);
                    if (containerFilePath !== scriptPath) {
                        const exported = await import(relativePath);
                        const typeNames = Object.keys(exported);
                        const types = typeNames.map(name => exported[name]);
                        const type = context.constructor;
                        if (types.find(t => t === type) || types.find(t => t === Object.getPrototypeOf(type))) {
                            const classes = getClassInfo(context);
                            return { path: relativePath.toString(), classes, types };
                        }
                        throw new Error('ciritcal error');
                    }
                }
            }
        }
    }
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
