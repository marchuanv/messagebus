const privateBag = new WeakMap();
export class Properties {
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @param { String } name
     * @returns { { obj: T } }
    */
    get(context, type, name) {
        const properties = privateBag.get(context);
        const prop = properties.find(p => p.name === name && p.type === type);
        if (!prop) {
            throw new Error(`could not find ${name} property`);
        }
        return { obj: prop.value };
    }
    /**
     * @template T
     * @param { Object } context
     * @param { T } type
     * @param { Object } property
    */
    set(context, type, property) {
        const keys = Object.keys(property);
        if (keys.length > 1) {
            throw new Error('property can only have one name. i.e { firstName: joe }');
        }
        const name = keys[0];
        const _property = { 
            type,
            name,
            value: property[name]
        };
        if (privateBag.has(context)) {
            const properties  = privateBag.get(context);
            properties.push(_property);
        } else {
            privateBag.set(context, [ _property ]);
        }
    }
}