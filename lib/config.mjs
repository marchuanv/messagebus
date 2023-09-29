import { existsSync } from 'node:fs';
import path from 'node:path'
const privateBag = new WeakMap();
class Property {
    constructor() {
        privateBag.set(this, { 
            name: null,
            value: null
        });
    }
    /**
     * @param {String} value
    */
    set name(value) {
        if (value && typeof value === 'string') {
            privateBag.get(this).name = value;
        } else {
            throw new Error('name must be a string');
        }
    }
    /**
     * @param { String | Number } value
    */
    set value(value) {
        if (value && (typeof value === 'string' || typeof value === 'number')) {
            privateBag.get(this).value = value;
        } else {
            throw new Error('value must be a string or a number');
        }
    }
}
class Reference {
    constructor() {
        privateBag.set(this, { 
            scriptPath: null,
            reference: null
        });
    }
    /**
     * @param { String } value
    */
    set scriptPath(value) {
        if (value && typeof value === 'string') {
            privateBag.get(this).scriptPath = value;
        } else {
            throw new Error('scriptPath must be a string');
        }
    }
    /**
     * @param { Object } value
    */
    set reference(value) {
        if (value && value.constructor) {
            privateBag.get(this).reference = value;
        } else {
            throw new Error('reference must be an instance');
        }
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
            const { ctor, scriptPath } = references[0];
            if (ctor === 'new Config()') {
                // let current = references.shift();
                // while(current) {
                //     current = references.shift();
                // }
                callback.call(this, {
                    Reference: (instance) => {
                        const ref = new Reference(instance);
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