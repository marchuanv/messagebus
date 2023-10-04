import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'url';
const privateBag = new WeakMap();
const _queue = [];
const getIntervalId = setInterval(async () => {
    if (_queue.length === 0) {
        return clearInterval(getIntervalId);
    }
    const { args, stack, resolve, reject, callback } = _queue.shift();
    const vars = privateBag.get(args.context);
    const locked = privateBag.get(Container);
    if (locked) {
        console.log('waiting');
    } else {
        privateBag.set(Container, true);
        vars.stack = stack;

        try {
            const results = await callback(args);
            resolve(results);
        } catch (error) {
            reject(error);
        } finally {
            privateBag.set(Container, false);
        }
    }
}, 100);

export class Container {
    constructor() {
        if (new.target === Container) {
            throw new TypeError(`${Container.name} must be extended`);
        }
        const Id = crypto.randomUUID();
        privateBag.set(this, { Id, lock: false, stack: null });
        privateBag.set(Container, false);
    }
    async getId() {
        const { Id } = privateBag.get(this) || {};
        return Id;
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
     * @param { Object } instance
     */
    static async setReference(ctx, instance) {
        return await queue({ context: ctx, instance }, async ({ context, instance }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            validateCalledInClassContext(context);
            if (Array.isArray(instance)) {
                for (const ins of instance) {
                    if (ins.getId && await ins.getId()) {
                        const test = getClassInfo(ins);
                        if (ins instanceof Container) {
                            await validateContainerClass(ins);
                            const Id = await instance.getId()
                            vars[Id] = instance;
                        }
                    }
                }
            } else {
                await validateContainerClass(instance);
                const Id = await instance.getId()
                vars[Id] = instance;
            }
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @returns { T }
     */
    static async getReference(ctx, type) {
        return await queue({ context: ctx, type }, async ({ context, type }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            await validateCalledInClassContext(context);
            const Id = await context.getId();
            for (const key of Object.keys(vars)) {
                const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
                let results = regexExp.exec(key);
                if (Array.isArray(results) && results.length > 0) {
                    const instance = vars[key];
                    if (Object.getPrototypeOf(instance.constructor) === type.constructor) {
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
    static async getProperty(ctx, propTemplate, type) {
        return await queue({ context: ctx, propTemplate, type }, async ({ context, propTemplate, type }) => {
            const vars = privateBag.get(context);
            validateContainerClass(context);
            await validateCalledInClassContext(context);
            const props = privateBag.get(context);
            const propName = Object.keys(propTemplate).reduce((x, key) => key);
            const propValue = props[propName];
            if (Object.getPrototypeOf(propValue) === type) {
                throw new Error(`${propName} property is not of type ${type}`);
            }
            return propValue;
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
function queue(args, callback) {
    const stack = (new Error()).stack.split("\n");
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
    stack = stack.filter(x => x.indexOf('at validateCalledInClassContext (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getReference (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setReference (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setProperty (') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getProperty (') === -1);
    stack = stack.filter(x => x.indexOf('at queue (') === -1);
    let classInfo = getClassInfo(context);
    if (classInfo.length === 0) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
    if (stack[0].indexOf('TomatoMessaging.getChannel') > -1) {
        debugger;
    }
    let foundClassInfo = getClassInfoForStack(context, stack, classInfo);
    if (!foundClassInfo) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
    let isValid = false;
    let regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
    let results = regEx.exec(foundClassInfo.stack);
    if (Array.isArray(results) && results.length > 0) {
        const scriptPath = path.resolve(results[0]);
        if (existsSync(scriptPath)) {
            const relativePath = pathToFileURL(scriptPath);
            const exported = await import(relativePath);
            const typeNames = Object.keys(exported);
            const types = typeNames.map(name => exported[name]);
            if (types.find(t => t === foundClassInfo.Class)) {
                isValid = true;
            } else {
                console.log();
            }
        }
    }
    if (!isValid) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
}

function getClassInfoForStack(context, stack, classInfo, currentClassInfoIndex = -1, currentStackIndex = -1) {
    if (currentClassInfoIndex === -1) {
        currentClassInfoIndex = 0;
    }
    if (currentStackIndex === -1) {
        currentStackIndex = 0;
    }
    if (currentStackIndex === stack.length) {
        return null;
    }
    const currentClassInfo = classInfo[currentClassInfoIndex];
    const currentStack = stack[currentStackIndex];
    if (!currentClassInfo || !currentStack) {
        return null;
    }
    let foundClassInfo = null;
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
    if (!foundClassInfo) {
        if (currentClassInfoIndex < classInfo.length) {
            currentClassInfoIndex = currentClassInfoIndex + 1;
        } else {
            currentClassInfoIndex = 0;
            if (currentStackIndex < stack.length) {
                currentStackIndex = currentStackIndex + 1;
            }
        }
        return getClassInfoForStack(context, stack, classInfo, currentClassInfoIndex, currentStackIndex);
    }
    return foundClassInfo;
}

function getClassInfo(ctx) {
    let _class = ctx.constructor;
    if (_class === Function) {
        _class = Object.getPrototypeOf(ctx);
    }
    if (_class === Container) {
        return [];
    }
    let _className = _class.name;
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
