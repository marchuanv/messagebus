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
        privateBag.set(this, { Id });
    }
    async getId() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @param { Object } prop
     */
    static setProperty(ctx, prop) {
        return (async () => {
            validateContainerClass(ctx);
            await validateCalledInClassContext(ctx);
            const vars = privateBag.get(ctx);
            const propName = Object.keys(prop).reduce((x, key) => key);
            const propValue = prop[propName];
            vars[propName] = propValue;
        })().catch((error) => {
            throw error;
        });
    }
    /**
     * @param { Object } instance
     */
    static setReference(ctx, instance) {
        return (async () => {
            validateContainerClass(ctx);
            await validateContainerClass(instance);
            validateCalledInClassContext(ctx);
            const vars = privateBag.get(ctx);
            vars[instance.Id] = instance;
        })().catch((error) => {
            throw error;
        });
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @returns { T }
     */
    static async getReference(ctx, type) {
        validateContainerClass(ctx);
        await validateCalledInClassContext(ctx);
        const instance = privateBag.get(ctx);
        if (instance instanceof type) {
            return instance;
        } else {
            throw new Error(`instance is not of type ${type}`);
        }
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { Object } propTemplate
     * @param { T } type
     * @returns { T }
     */
    static async getProperty(ctx, propTemplate, type) {
        validateContainerClass(ctx);
        await validateCalledInClassContext(ctx);
        const props = privateBag.get(ctx);
        const propName = Object.keys(propTemplate).reduce((x, key) => key);
        const propValue = props[propName];
        if (Object.getPrototypeOf(propValue) === type) {
            throw new Error(`${propName} property is not of type ${type}`);
        }
        return propValue;
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
    const stack = (new Error()).stack.split("\n");
    let current = stack.shift();
    let metadata = [];
    while (current) {
        let regEx = new RegExp('at\\s+new\\s+[a-zA-Z]+\\s+\\(');
        let results = regEx.exec(current);
        if (Array.isArray(results) && results.length > 0) {
            regEx = new RegExp('new [a-zA-Z]+');
            results = regEx.exec(current);
            const ctor = `${results[0]}()`;
            if (Array.isArray(results) && results.length > 0) {
                regEx = new RegExp(`[a-zA-Z0-9\/.-]+.mjs`);
                results = regEx.exec(current);
                if (Array.isArray(results) && results.length > 0) {
                    const scriptPath = path.resolve(results[0]);
                    if (existsSync(scriptPath)) {
                        const mtd = { ctor, types: [] };
                        const relativePath = pathToFileURL(scriptPath);
                        const exported = await import(relativePath);
                        const typeNames = Object.keys(exported);
                        mtd.types = typeNames.map(name => exported[name]);
                        metadata.push(mtd);
                    }
                }
            }
        }
        current = stack.shift();
    }
    const { ctor, types } = metadata.find(m =>
        m.types.find(t => t === context.constructor)
    ) || {};
    throw new Error(`container method(s) was not called in a container class context`);
}
