import crypto from 'node:crypto';
import { Properties } from "./properties.mjs";
import { TypeRegister } from './typeregister.mjs';

const childrenPropName = 'b358b901-18d0-4bc7-8528-30c0fae100ca';
const parentPropName = '70f5f7f7-7231-48c7-9f62-076d50ac9094';

const _properties = new Properties();
const traversedObjects = [];
const privateBag = new WeakMap();

export class Serialisable {
    constructor() {
        privateBag.set(this, crypto.randomUUID());
        if (!this.Id || (this.Id && !isValidGUID(this.Id))) {
            throw new Error('all serialisable classes needs a get Id property that returns a uuid');
        }
    }
    /**
     * @returns { String }
    */
    get Id() { return privateBag.get(this) }

    /**
    * @returns { String }
    */
    serialise() {
        const jsonKeyValueTemplate = '"[key]":"[value]"';
        const context = [{
            obj: buildSerialisableObject(this),
            keys: sortByUuid(Object.keys(buildSerialisableObject(this))),
            index: 0,
            count: 0
        }];
        let current = context[0];
        const lines = [];
        do {
            const { obj, keys } = current;
            if (current.count === 0) {
                const prevLine = lines[lines.length - 1];
                if (prevLine !== '[open]') {
                    lines.push('[open]');
                }
            }
            while (current.index < keys.length) {
                current.count = (current.index + 1);
                const key = keys[current.index];
                let value = obj[key];
                if (key === 'type') {
                    const _type = TypeRegister.Type(obj.type);
                    value = {
                        Id: obj.type,
                        name: _type.name
                    };
                }
                if (isValidGUID(key) && value !== undefined && value !== null) { //uuids are objects
                    let obj2 = value;
                    const type = TypeRegister.Type(obj2.type);
                    if (typeof obj2.value === 'string' && obj2.value.startsWith('{') && obj2.value.endsWith('}')) {
                        if (Object.getPrototypeOf(type) === Serialisable) {
                            const depObj = JSON.parse(obj2.value);
                            obj2[depObj.Id] = depObj;
                            obj2.value = undefined;
                        } else if (type === Object) {
                            obj2.value = JSON.parse(obj2.value);
                        }
                    }
                    context.unshift({
                        obj: obj2,
                        keys: sortByUuid(Object.keys(obj2)),
                        index: 0,
                        count: 0
                    });
                    current.index = current.index + 1;
                    let line = `${jsonKeyValueTemplate.replace('[key]', key)}`;
                    line = `${line.replace('"[value]"', '')}`;
                    lines.push(line);
                    lines.push('[open]');
                    break;
                } else {
                    const boolValue = (
                        value === true || (typeof value === 'string' && value.toLowerCase() === 'true') ? true :
                            value === false || (typeof value === 'string' && value.toLowerCase() === 'false') ? false :
                                undefined
                    );
                    if (boolValue !== undefined) {
                        value = boolValue;
                    } else if (value === null || value === 'null' || value === undefined || value === 'undefined') {
                        value = null;
                    } else if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    } else if (!isNaN(value)) {
                        value = Number(value);
                    } else {
                        value = `"${value}"`;
                    }
                    let line = `${jsonKeyValueTemplate.replace('[key]', key)}`;
                    line = `${line.replace('"[value]"', value)}`;
                    lines.push(line);
                }
                current.index = current.index + 1;
            }
            if (current.count === keys.length) {
                const prevLine = lines[lines.length - 1];
                if (prevLine !== '[open]') {
                    lines.push('[close]');
                }
                context.shift();
                current = context[0];
            } else {
                current = context[0];
            }
        } while (current);
        const jsonStr = lines.join(',')
            .replace(/\[open]/g, '{')
            .replace(/\[close]/g, '}')
            .replace(/\{,/g, '{')
            .replace(/\,}/g, '}')
            .replace(/\:,/g, ':');
        const json = JSON.parse(jsonStr);
        return JSON.stringify(json, null, 4);
    }
    /**
     * @template T
     * @param { T } type
     * @param { String } jsonStr
     * @returns { T }
     */
    static deserialise(jsonStr) {
        const instances = [];
        walkDeserialised(jsonStr, (current) => {
            const type = TypeRegister.Type(current.type.Id);
            const args = [];
            let existing = instances.find(x => x.Id === current.Id);
            if (existing) {
                return;
            }
            for (const child of current[childrenPropName]) {
                existing = instances.find(x => x.Id === child.Id);
                if (existing) {
                    args.push(existing.value);
                } else {
                    const childType = TypeRegister.Type(child.type.Id);
                    if (childType === String) {
                        args.push(child.value);
                    }
                    if (childType === Number) {
                        args.push(child.value);
                    }
                }
            }
            let isSerialisable = false;
            let proto = Object.getPrototypeOf(type);
            while (proto) {
                if (proto === Serialisable) {
                    isSerialisable = true;
                    break;
                }
                proto = Object.getPrototypeOf(proto);
            }
            if (isSerialisable) {
                const instance = new type(...args);
                instances.push({ Id: current.Id, name: type.name, value: instance });
                console.log();
            } else {
                instances.push({ Id: current.Id, name: current.name, value: current.value });
            }
        });
    }
}

/**
* @returns { Object }
*/
function buildSerialisableObject(instance) {
    let properties = _properties.all(instance);
    if (!properties) {
        properties = _properties.all(instance.constructor);
    }
    let obj = {
        Id: instance.Id,
        type: TypeRegister.Id(instance.constructor)
    };
    const prevObj = traversedObjects.find(o => o.Id === obj.Id);
    if (prevObj) {
        return prevObj;
    } else {
        traversedObjects.push(obj);
    }
    for (const prop of properties) {
        const newProp = {
            Id: prop.Id,
            name: prop.name,
            isArray: Array.isArray(prop.type) && Array.isArray(prop.value),
            type: Array.isArray(prop.type) ?
                TypeRegister.Id(prop.type[0].constructor) :
                TypeRegister.Id(prop.type.constructor),
            value: null
        };
        if (newProp.isArray) {
            for (const _instance of prop.value) {
                if (_instance instanceof Serialisable) {
                    if (_instance !== instance) {
                        newProp.value = buildSerialisableObject(_instance);
                        const json = JSON.stringify(newProp.value);
                        newProp.value = json;
                    }
                }
            }
        } else if (prop.value instanceof Serialisable) {
            if (prop.value !== instance) {
                newProp.value = buildSerialisableObject(prop.value);
                const json = JSON.stringify(newProp.value);
                newProp.value = json;
            }
        } else if (typeof prop.value === 'object') {
            newProp.value = JSON.stringify(prop.value);
        } else {
            newProp.value = prop.value;
        }
        obj[newProp.Id] = newProp;
    }
    return obj;
}

function sortByUuid(array) {
    return array.sort((x) => {
        if (isValidGUID(x)) {
            return -1;
        } else {
            return 1
        }
    });
}

function isValidGUID(str) {
    // Regex to check valid
    // GUID
    let regex = new RegExp(/^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/);

    // if str
    // is empty return false
    if (str == null) {
        return false;
    }

    // Return true if the str
    // matched the ReGex
    if (regex.test(str) == true) {
        return true;
    }
    else {
        return false;
    }
}

function walkDeserialised(deserialised, callback) {
    const deserialisedObject = typeof deserialised === 'object' ? deserialised : JSON.parse(deserialised);
    let context = [{
        obj: deserialisedObject,
        keys: sortByUuid(Object.keys(deserialisedObject)),
        index: 0,
        count: 0
    }];

    let current = context[0];
    let resolved = [];
    do {
        const { obj, keys } = current;
        if (!obj[childrenPropName]) {
            obj[childrenPropName] = [];
        }
        const parentPropNameIndex = keys.findIndex(k => k === parentPropName);
        if (parentPropNameIndex > -1) {
            keys.splice(parentPropNameIndex, 1);
        }
        const childrenPropNameIndex = keys.findIndex(k => k === childrenPropName);
        if (childrenPropNameIndex > -1) {
            keys.splice(childrenPropNameIndex, 1);
        }
        while (current.index < keys.length) {
            current.count = (current.index + 1);
            const key = keys[current.index];
            let value = obj[key];
            if (isValidGUID(key) && value) {
                const obj2 = value;
                obj2[parentPropName] = obj;
                obj[childrenPropName].push(obj2);
                context.unshift({
                    obj: obj2,
                    keys: sortByUuid(Object.keys(obj2)),
                    index: 0,
                    count: 0
                });
                delete obj[key];
            }
            current.index = current.index + 1;
        }
        if (current.count === keys.length) {
            const popped = context.pop();
            resolved.unshift(popped);
            current = context[0];
        }
        current = context[context.length - 1];
    } while (current);
    for (const current of resolved) {
        callback(current.obj);
    }
}