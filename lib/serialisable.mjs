import { Properties } from "./properties.mjs";
const _properties = new Properties();
export class Serialisable {
    /**
     * @returns { String }
     */
    serialise() {
        const properties = _properties.all(this);
        const adjustedProperties = properties.map(prop => {
            if (Object.getPrototypeOf(prop.type) === Serialisable.prototype) {
                prop.type = prop.type.constructor;
            }
            if (prop.type) {
                prop.type = prop.type.name ? prop.type.name : 'unknown';
            }
            return prop;
        });
        let json = JSON.stringify(adjustedProperties);
        return json;
    }
    /**
     * @template T
     * @param { T } type
     * @param { String } jsonStr
     * @returns { T }
     */
    static deserialise(type, jsonStr) {
        const properties = _properties.all(this);
        const props = properties.all(this);
    }
}