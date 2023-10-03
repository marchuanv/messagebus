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
        privateBag.set(this, { Id, lock: false });
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
        return new Promise((resolve, reject) => {
            const setPropertyId = setInterval(async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval(setPropertyId);
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
            }, 100);
        });
    }
    /**
     * @param { Object } instance
     */
    static setReference(ctx, instance) {
        const vars = privateBag.get(ctx);
        return new Promise((resolve, reject) => {
            const setReferenceId = setInterval(async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval(setReferenceId);
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
            }, 100);
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
        return new Promise((resolve, reject) => {
            const getReferenceId = setInterval(async () => {
                if (!vars.lock) {
                    vars.lock = true;
                    clearInterval(getReferenceId);
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
            }, 100);
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
        return new Promise((resolve) => {
            const setPropertyId = setInterval(async () => {
                const vars = privateBag.get(ctx);
                if (vars.lock) {
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
                }
            }, 100);
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
    let stack = (new Error()).stack.split("\n");
    stack.splice(0, 1);
    stack = stack.filter(x => x.indexOf('at validateCalledInClassContext (file:///C:/github/messagebus/lib/container.mjs') === -1);
    stack = stack.filter(x => x.indexOf('at Function.getReference (file:///C:/github/messagebus/lib/container.mjs') === -1);
    const stackContext = stack[0];
    const Class = context.constructor
    const className = Class.name;
    let isValid = false;
    let regEx = new RegExp('at\\s+new\\s+[a-zA-Z]+\\s+\\(');
    let results = regEx.exec(stackContext);
    if (Array.isArray(results) && results.length > 0) {
        isValid = true;
    }
    if (!isValid) {
        for (const memberName of Object.getOwnPropertyNames(Class.prototype)) {
            regEx = new RegExp(`at\\s+${className}.${memberName}\\s+\\(`);
            results = regEx.exec(stackContext);
            if (Array.isArray(results) && results.length > 0) {
                isValid = true;
            }
        }
    }
    regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
    results = regEx.exec(stackContext);
    if (Array.isArray(results) && results.length > 0) {
        const scriptPath = path.resolve(results[0]);
        if (existsSync(scriptPath)) {
            const relativePath = pathToFileURL(scriptPath);
            const exported = await import(relativePath);
            const typeNames = Object.keys(exported);
            const types = typeNames.map(name => exported[name]);
            if (types.find(t => t === context.constructor)) {
                isValid = true;
            }
        }
    }
    if (!isValid) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
}
