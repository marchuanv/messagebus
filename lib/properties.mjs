const privateBag = new WeakMap();
/**
 * @template T
 */
export class Property {
    /**
     * @param { T } type
     * @param { { name: String, value: T } } property
     */
    constructor(type, property) {
        privateBag.set(this, { type, property });
    }
    /**
     * @returns { String }
     */
    get name() {
        const { name } = privateBag.set(this);
        return name;
    }
    /**
     * @returns { T }
     */
    get value() {
        const { value } = privateBag.set(this);
        return value;
    }
}
export class Properties {
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @returns { Property<T> } property
    */
    get(context, type) {
        const properties = privateBag.get(context);
        return Object.keys(properties).reduce((property, key) => {
            const origProperty = properties[key];
            if (type === origProperty.type) {
                property[key] = origProperty;
            }
            return property;
        }, {});
        return property.value;
    }
    /**
     * @template T
     * @param { Object } context
     * @param { Property<T> } property
    */
    set(context, property) {
        privateBag.set(context, property);
    }
}