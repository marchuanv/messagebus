import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
const privateBag = new WeakMap();
export class Container {
    constructor() {
        if (new.target === Container) {
            throw new TypeError(`${Container.name} must be extended`);
        }
        this.Id = crypto.randomUUID();
        privateBag.set(this, {});
        privateBag.delete(Container); //clear context
    }
    /**
     * @param { Object } prop
     */
    static setProperty(ctx, prop) {
        validateContainerClass(ctx);
        validateCalledInClassContext(ctx);
        const vars = privateBag.get(ctx);
        const propName = Object.keys(prop).reduce((x, key) => key);
        const propValue = prop[propName];
        vars[propName] = propValue;
    }
    /**
     * @param { Object } instance
     */
    static setReference(ctx, instance) {
        validateContainerClass(ctx);
        validateContainerClass(instance);
        validateCalledInClassContext(ctx);
        const vars = privateBag.get(ctx);
        vars[instance.Id] = instance;
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @returns { T }
     */
    static getReference(ctx, type) {
        validateContainerClass(ctx);
        validateCalledInClassContext(ctx);
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
    static getProperty(ctx, propTemplate, type) {
        validateContainerClass(ctx);
        validateCalledInClassContext(ctx);
        const props = privateBag.get(ctx);
        const propName = Object.keys(propTemplate).reduce((x, key) => key);
        const propValue = props[propName];
        if (Object.getPrototypeOf(propValue) === type) {
            throw new Error(`${propName} property is not of type ${type}`);
        }
        return propValue;
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
function validateCalledInClassContext(context) {
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
                        const exported = import(scriptPath);
                        const typeNames = Object.keys(exported);
                        mtd.types = typeNames.map(name => exported[name]);
                        metadata.push(mtd);
                    }
                }
            }
        }
        current = stack.shift();
    }
    let [{ ctor, types }] = metadata[0];
    if (ctor === `new ${Container.name}()`) {
        ([{}, { ctor, types }] = metadata[1]);
        if (types.find(t => t === context.constructor)) {
            return;
        }
    }
    throw new Error(`container method(s) was not called in a container class context`);
}