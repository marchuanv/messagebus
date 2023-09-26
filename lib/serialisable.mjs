import { Properties } from "./properties.mjs";
const _properties = new Properties();
const knownTypes = new WeakMap();
const knownTypeIds = new Map();

export class Serialisable {
    /**
     * @returns { String }
     */
    serialise() {
        let properties = _properties.all(this);
        if (!properties) {
            properties = _properties.all(this.constructor);
        }
        const obj = { name: this.constructor.name, properties: [] };
        for (const prop of properties) {
            const newProp = {};
            newProp.name = prop.name;
            let Id = prop.type.constructor.toString();
            let buff = Buffer.from(Id, 'utf-8');
            let base64 = buff.toString('base64');
            if (typeof prop.value === 'object') {
                if (prop.value instanceof Serialisable) {
                    const { properties } = prop.value.serialise();
                    newProp.properties = properties;
                }
            } else {
                knownTypes.set(prop.type, base64);
                knownTypeIds.set(base64, prop.type);
                newProp.type = knownTypes.get(prop.type);
                newProp.value = prop.value;
            }
            obj.properties.push(newProp);
        }
        return obj;
    }
    /**
     * @template T
     * @param { T } type
     * @param { String } jsonStr
     * @returns { T }
     */
    static deserialise(type, jsonStr) {
        const template = JSON.parse(jsonStr);
        if (template) {
            const _properties = new Properties();
            const built = buildObj(template, _properties);
            return JSON.stringify(built);
        }
    }
}

function buildObj(template, storedProperties) {
    return Object.keys(template.properties).reduce((obj, key) => {
        const prop = obj.properties[key];
        const T = knownTypeIds.get(prop.type);
        let proto = T;
        let isSerialisable = false;
        let propertyPrototypeKey = T;
        while (proto) {
            if (Object.getPrototypeOf(proto) === Serialisable) {
                isSerialisable = true;
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
        proto = T;
        propertyPrototypeKey = null;
        while (proto) {
            if (storedProperties.has(this, proto, key)) {
                propertyPrototypeKey = proto;
                break;
            }
            proto = Object.getPrototypeOf(proto);
        }
        if (propertyPrototypeKey) {
            if (isSerialisable) {
                if (prop.isArray) {
                    let obj2 = storedProperties.get(this, [propertyPrototypeKey], key);
                    if (obj2.length > 0) {
                        for (let i = 0; i < obj2.length; i++) {
                            let obj3 = obj2[i];
                            obj3 = JSON.parse(obj3.serialise());
                            prop.properties = obj2.properties;
                        }
                    }
                    prop.type = propertyPrototypeKey.toString();
                    console.log();
                } else {
                    let obj2 = storedProperties.get(this, propertyPrototypeKey, key);
                    obj2 = JSON.parse(obj2.serialise());
                    prop.properties = obj2.properties;
                    prop.type = propertyPrototypeKey.toString();

                }
            } else {
                prop.value = storedProperties.get(this, propertyPrototypeKey, key);
            }
        }
        return obj;
    }, template);
}