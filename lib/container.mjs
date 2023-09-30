import { existsSync } from 'node:fs';
import path from 'node:path';
const privateBag = new WeakMap();
class Type { }
privateBag.set(Type, new WeakMap());
class Property {
    constructor(name, value) {
        if (name && typeof name === 'string') {
            if (value && (typeof value === 'string' || typeof value === 'number')) {
                privateBag.set(this, { _name: name, _value: value });
            } else {
                throw new Error('value must be a string or a number');
            }
        } else {
            throw new Error('name must be a string');
        }
    }
    /**
     * @returns {String}
    */
    get name() {
        const { _name } = privateBag.get(this);
        return _name;
    }
    /**
     * @returns { String | Number }
    */
    get value() {
        const { _value } = privateBag.get(this);
        return _value;
    }
}
class Reference {
    /**
     * @param { Object } instance
     * @param { String } scriptPath
    */
    constructor(instance, scriptPath) {
        if (instance && instance.constructor) {
            if (scriptPath && typeof scriptPath === 'string') {
                privateBag.set(this, { instance, scriptPath });
            } else {
                throw new Error('scriptPath must be a string');
            }
        } else {
            throw new Error('instance must be an instance of a class');
        }
    }
    /**
     * @returns { String }
    */
    get scriptPath() {
        const { scriptPath } = privateBag.get(this);
        return scriptPath;
    }
    /**
     * @returns { Object }
    */
    get reference() {
        const { instance } = privateBag.get(this);
        return instance;
    }
}
export class Container {
    /**
     * @param { Function } callback
    */
    constructor() {
        if (new.target === Reference) {
            throw new TypeError(`${Reference.name} must be extended`);
        }
        privateBag.set(this, {});
        privateBag.delete(Container); //clear context
    }
    /**
     * @param { Object } ctx
    */
    static set context(ctx) {
        privateBag.set(Container, ctx); //set context
    }
    /**
     * @param { { name: String, value: String | Number } } prop
     */
    static set property(prop) {
        if (!privateBag.has(Container)) {
            throw new Error('context should be set first');
        }
        const { name, value } = prop || {};
        if (name && value) {
            const newProperty = new Property(prop);
            const vars = privateBag.get(Container.context);
        }
    }
    /**
     * @param { Object } ref
     */
    static set reference(ref) {
        if (!privateBag.has(Container)) {
            throw new Error('context should be set first');
        }
        let [{ ctor, script }] = getClassMetadataFromCallstack();
        if (ctor === `new ${Container.name}()`) {
            ([{}, { script }] = getClassMetadataFromCallstack());
            const newProperty = new Reference(ref, script);
        }
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { T } type
     * @returns { T }
     */
    static getReference(ctx, type) {
        const refs = privateBag.get(Type);
        const instance = refs.get(context);
        let [{ ctor, script }] = getClassMetadataFromCallstack();
        if (ctor === `new ${Container.name}()`) {
            ([{}, { script }] = getClassMetadataFromCallstack());
            const exported = import(script);
            if (exported[context.constructor.name]) { //check that the get function was called in the correct context

            }
        }
        return instance;
    }
    /**
     * @template T
     * @param { Object } ctx
     * @param { Object } propTemplate
     * @param { T } type
     * @returns { T }
     */
    static getProperty(ctx, propTemplate, type) {
        const refs = privateBag.get(Type);
        const instance = refs.get(context);
        let [{ ctor, script }] = getClassMetadataFromCallstack();
        if (ctor === `new ${Container.name}()`) {
            ([{}, { script }] = getClassMetadataFromCallstack());
            const exported = import(script);
            if (exported[context.constructor.name]) { //check that the get function was called in the correct context

            }
        }
        return instance;
    }
}
/**
 * @returns { Array<{ ctor: String, script: String }> }
 */
function getClassMetadataFromCallstack() {
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
                        metadata.push({ ctor, script: results[0] });
                    }
                }
            }
        }
        current = stack.shift();
    }
    return metadata;
}