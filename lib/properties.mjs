const privateBag = new WeakMap();
export class Properties {
    constructor() {
        if (new.target !== Properties) {
            throw new TypeError(`${Properties.name} can't be extended`);
        }
    }
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @param { String } name
     * @returns { T }
    */
    get(context, type, name) {
        const prop = getProperty.call(context, type, name);
        if (!prop) {
            throw new Error(`could not find ${name} property`);
        }
        return prop.value;
    }
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @param { String } name
     * @returns { Boolean }
    */
    has(context, type, name) {
        return getProperty.call(context, type, name) !== undefined;
    }
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @param { Object } property
    */
    set(context, type, name, value) {
        if (value === null || value === undefined) {
            throw new Error(`${name} is null or undefined, expected a value of type: ${type.constructor.name}`);
        }
        if (Array.isArray(type) && Array.isArray(value)) {
            if (value.length > 0) {
                if (!(Object.getPrototypeOf(value[0]) === type[0]) && !(Object.getPrototypeOf(Object.getPrototypeOf(value[0])) === type[0])) {
                    throw new Error(`property value is not of type ${type.constructor.name}`);
                }
            }
        } else {
            if (!(Object.getPrototypeOf(value) === type) && !(Object.getPrototypeOf(Object.getPrototypeOf(value)) === type)) {
                throw new Error(`property value is not of type ${type.constructor.name}`);
            }
        }
        const _property = { type, name, value };
        if (privateBag.has(context)) {
            const properties = privateBag.get(context);
            if (this.has(context, type, name)) {
                const prop = getProperty.call(context, type, name);
                prop.value = value;
            } else {
                properties.push(_property);
            }
        } else {
            privateBag.set(context, [_property]);
        }
    }
    all(context) {
        if (privateBag.has(context)) {
            return privateBag.get(context);
        }
    }
}

function getProperty(type, name) {
    const properties = privateBag.get(this);
    if (properties) {
        const prop = properties.find(p =>
            p.name === name &&
            (
                p.type === type ||
                p.type.constructor === type ||
                p.type === type.constructor ||
                p.type.constructor === type.constructor ||
                (
                    Array.isArray(type) && Array.isArray(p.type) &&
                    p.type.find(pType =>
                        type.find(pType2 => pType2 === pType || pType2 === pType.constructor)
                    )
                )
            )
        );
        if (prop) {
            return prop;
        }
    }
}