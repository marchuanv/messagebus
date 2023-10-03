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
        const { Id } = privateBag.get(this) || {};
        return Id;
    }
    /**
     * @param { Object } prop
     */
    static async setProperty(ctx, prop) {
        return await ready(ctx, async (vars) => {
            validateContainerClass(ctx);
            await validateCalledInClassContext(ctx);
            const propName = Object.keys(prop).reduce((x, key) => key);
            const propValue = prop[propName];
            vars[propName] = propValue;
        });
    }
    /**
     * @param { Object } instance
     */
    static async setReference(ctx, instance) {
        return await ready(ctx, async(vars) => {
            validateContainerClass(ctx);
            validateCalledInClassContext(ctx);
            if (Array.isArray(instance)) {
                for(const ins of instance) {
                    if (ins.getId && await ins.getId()){
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
        return await ready(ctx, async (vars) => {
            validateContainerClass(ctx);
            await validateCalledInClassContext(ctx);
            const Id = await ctx.getId();
            for(const key of Object.keys(vars)) {
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
        await ready(ctx, async (vars) => {
            validateContainerClass(ctx);
            await validateCalledInClassContext(ctx);
            const props = privateBag.get(ctx);
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
function ready(ctx, callback) {
    const vars = privateBag.get(ctx);
    const stack = (new Error()).stack.split("\n");
    return new Promise(async (resolve, reject) => {
        const getInterval = async () => {
            if (!vars.lock) {
                vars.lock = true;
                vars.stack = stack;
                clearInterval(getIntervalId);
                try {
                    const results = await callback(vars);
                    resolve(results);
                } catch (error) {
                    reject(error);
                } finally {
                    vars.lock = false;
                }
            }
        };
        const getIntervalId = await setInterval(getInterval, 100);
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
    stack = stack.filter(x => x.indexOf('at ready (') === -1);
    const stackContext = stack[0];
    const classInfo = getClassInfo(context);
    let isValid = false;
    let info = null;
    for (const _info of classInfo) {
        let regEx = new RegExp(`at\\s+new\\s+${ _info.name }\\s+\\(`);
        let results = regEx.exec(stackContext);
        if (Array.isArray(results) && results.length > 0) {
            isValid = true;
            info = _info;
            break;
        } else {
            for (const memberName of _info.members) {
                let regEx = new RegExp(`at\\s+${_info.name}.${memberName}\\s+\\(`);
                let results = regEx.exec(stackContext);
                if (Array.isArray(results) && results.length > 0) {
                    isValid = true;
                    info = _info;
                    break;
                }
            }
        }
    }
    if (!isValid) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
    isValid = false;
    let regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
    let results = regEx.exec(stackContext);
    if (Array.isArray(results) && results.length > 0) {
        const scriptPath = path.resolve(results[0]);
        if (existsSync(scriptPath)) {
            const relativePath = pathToFileURL(scriptPath);
            const exported = await import(relativePath);
            const typeNames = Object.keys(exported);
            const types = typeNames.map(name => exported[name]);
            if (types.find(t => t === info.Class)) {
                isValid = true;
            }
        }
    }
    if (!isValid) {
        throw new Error(`container method(s) was not called in a container class context`);
    }
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
    let items = [{ Class: _class, name: _className, members }];
    if (_class && _className) {
        const _items = getClassInfo(_class);
        items = items.concat(_items);
    }
    return items;
}
