const privateBag = new WeakMap();
export class Properties {
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
        const _property = { type,  name, value };
        if (privateBag.has(context)) {
            const properties  = privateBag.get(context);
            if (this.has(context, type, name)) {
                const prop = getProperty.call(context, type, name);
                prop.value = value;
            } else {
                properties.push(_property);
            }
        } else {
            privateBag.set(context, [ _property ]);
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
                (
                    Array.isArray(type) && Array.isArray(p.type) && 
                    p.type.find(pType =>
                        type.find(pType2 => pType2 === pType)
                    )
                )
            )
        );
        if (prop) {
            return prop;
        }
    }
}