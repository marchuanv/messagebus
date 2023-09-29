import { existsSync } from 'node:fs';
import path from 'node:path'
const privateBag = new WeakMap();
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
export class Config {
    /**
     * @param { Function } callback
     */
    constructor(callback) {
        if (new.target === Reference) {
            throw new TypeError(`${Reference.name} must be extended`);
        }
        privateBag.set(this, []);
        const references = getClassMetadataFromCallstack();
        if (references && references.length > 0) {
            let { ctor } = references[0];
            if (ctor === 'new Config()') {
                let { script } = references[1];
                const thisRef = new Reference(this, script);
                privateBag.get(this).push(thisRef);
                callback.call(this, {
                    Reference: (instance) => {
                        if (!privateBag.has(instance)) {
                            throw new Error('instance referenced is not configured.');
                        }
                        const ref = new Reference(instance, script);
                        privateBag.get(this).push(ref);
                        Object.freeze(ref);
                    },
                    Property: (name, value) => {
                        const property = new Property(name, value);
                        privateBag.get(this).push(property);
                        Object.freeze(property);
                    }
                });
            } else {
                throw new Error('new Config() is not at the top of the callstack');
            }
        } else {
            throw new Error(`invalid or no references`);
        }
    }
}

function getClassMetadataFromCallstack() {
    const stack = (new Error()).stack.split("\n");
    let current = stack.shift();
    let metadata = [];
    while(current) {
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
                        metadata.push({ ctor, script:results[0] });
                    }
                }
            }
        }
        current = stack.shift();
    }
    return metadata;
}