import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'url';
const privateBag = new WeakMap();
export class Container {
    constructor() {
        if (new.target === Container) {
            throw new TypeError(`${Container.name} must be extended`);
        }
        const Id = crypto.randomUUID();
        privateBag.set(this, { Id, lock: false, stack: null });
    }
    async getId() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @param { Object } prop
     */
    static setProperty(ctx, prop) {
        const vars = privateBag.get(ctx);
        vars.stack = (new Error()).stack.split("\n");
        return new Promise((resolve, reject) => {
            const setPropertyInterval = async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval((await setPropertyId));
                    try {
                        validateContainerClass(ctx);
                        await validateCalledInClassContext(ctx);
                        const propName = Object.keys(prop).reduce((x, key) => key);
                        const propValue = prop[propName];
                        vars[propName] = propValue;
                        resolve();
                    } catch (error) {
                        reject(error);
                    } finally {
                        vars.lock = false;
                    }
                }
            };
            const setPropertyId = setInterval(setPropertyInterval, 100);
        });
    }
    /**
     * @param { Object } instance
     */
    static setReference(ctx, instance) {
        const vars = privateBag.get(ctx);
        vars.stack = (new Error()).stack.split("\n");
        return new Promise((resolve, reject) => {
            const setReferenceInterval = async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval((await setReferenceId));
                    try {
                        validateContainerClass(ctx);
                        await validateContainerClass(instance);
                        validateCalledInClassContext(ctx);
                        vars[instance.Id] = instance;
                        resolve();
                    } catch (error) {
                        reject(error);
                    } finally {
                        vars.lock = false;
                    }
                }
            }
            const setReferenceId = setInterval(setReferenceInterval, 100);
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @returns { T }
     */
    static async getReference(ctx, type) {
        const vars = privateBag.get(ctx);
        vars.stack = (new Error()).stack.split("\n");
        return new Promise((resolve, reject) => {
            const getReferenceInterval = async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval((await getReferenceId));
                    try {
                        validateContainerClass(ctx);
                        await validateCalledInClassContext(ctx);
                        const instance = vars[ctx.Id];
                        if (instance && instance instanceof type) {
                            resolve(instance);
                        }
                    } catch (error) {
                        reject(error);
                    } finally {
                        vars.lock = false;
                    }
                }
            };
            const getReferenceId = setInterval(getReferenceInterval, 100);
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { Object } propTemplate
     * @param { T } type
     * @returns { T }
     */
    static getProperty(ctx, propTemplate, type) {
        const vars = privateBag.get(ctx);
        vars.stack = (new Error()).stack.split("\n");
        return new Promise((resolve) => {
            const getPropertyInterval = async () => {
                if (vars.lock) {
                    vars.lock = true;
                    clearInterval((await getPropertyId));
                    try {
                        validateContainerClass(ctx);
                        await validateCalledInClassContext(ctx);
                        const props = privateBag.get(ctx);
                        const propName = Object.keys(propTemplate).reduce((x, key) => key);
                        const propValue = props[propName];
                        if (Object.getPrototypeOf(propValue) === type) {
                            throw new Error(`${propName} property is not of type ${type}`);
                        }
                        resolve(propValue);
                        clearInterval(setPropertyId);
                    } catch (error) {
                        reject(error);
                    } finally {
                        vars.lock = false;
                    }
                }
            }
            const getPropertyId = setInterval(getPropertyInterval, 100);
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
    stack = stack.filter(x => x.indexOf('at Function.getReference (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setProperty (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getProperty (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.setReference (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getReference (file:///C:/github/messagebus/lib/container.mjs') === -1);
    const stackContext = stack[0];
    let Class = context.constructor;
    let className = Class.name;
    let isValid = false;
    let regEx = new RegExp(`at\\s+new\\s+${className}\\s+\\(`);
    let results = regEx.exec(stackContext);
    if (Array.isArray(results) && results.length > 0) {
        isValid = true;
    } else {
        Class = Object.getPrototypeOf(context.constructor);
        className = Class.name;
        regEx = new RegExp(`at\\s+new\\s+${className}\\s+\\(`);
        results = regEx.exec(stackContext);
        if (Array.isArray(results) && results.length > 0) {
            isValid = true;
        } else {
            Class = Object.getPrototypeOf(context.constructor);
            className = Class.name;
            while (prototype) {
                regEx = new RegExp(`at\\s+new\\s+${className}\\s+\\(`);
                results = regEx.exec(stackContext);
                if (Array.isArray(results) && results.length > 0) {
                    isValid = true;
                }
                Class = Object.getPrototypeOf(context);
                className = Class.name;
            }
        }

    }
    if (!isValid) {
        let memberNames = Object.getOwnPropertyNames(Class).concat(memberNames);
        let prototype = Object.getPrototypeOf(Class.prototype);
        while (prototype) {
            memberNames = Object.getOwnPropertyNames(prototype).concat(memberNames);
            prototype = Object.getPrototypeOf(prototype);
        }
        for (const memberName of memberNames) {
            regEx = new RegExp(`at\\s+${className}.${memberName}\\s+\\(`);
            results = regEx.exec(stackContext);
            if (Array.isArray(results) && results.length > 0) {
                isValid = true;
                break;
            }
        }
    }
    isValid = false;
    regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
    results = regEx.exec(stackContext);
    if (Array.isArray(results) && results.length > 0) {
        const scriptPath = path.resolve(results[0]);
        if (existsSync(scriptPath)) {
            const relativePath = pathToFileURL(scriptPath);
            const exported = await import(relativePath);
            const typeNames = Object.keys(exported);
            const types = typeNames.map(name => exported[name]);
            if (types.find(t => t === Class)) {
                isValid = true;
            }
        }
    }
    if (!isValid) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
}
