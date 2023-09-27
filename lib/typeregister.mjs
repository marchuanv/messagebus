const Ids = new WeakMap();
const types = new Map();
export class TypeRegister {
    /**
     * @template T
     * @param { T } type
     * @param { String } uuid
     * @returns { T }
     */
    static Bind(type, uuid) {
        Ids.set(type, uuid);
        types.set(uuid, type);
    }
    /**
     * @template T
     * @param { T } type
     * @param { String } uuid
     * @returns { String }
     */
    static Id(type) {
        return Ids.get(type);
    }
    /**
     * @param { String } uuid
     * @returns { Object }
     */
    static Type(uuid) {
        return types.get(uuid);
    }
}
TypeRegister.Bind(String, '78bdce42-14d5-4bf5-9495-277e006940c4');
TypeRegister.Bind(Object, '049a3d22-2975-4903-887c-1b63787445a8');
TypeRegister.Bind(Number, '87cab040-512f-40e5-bf02-16cb70ac4abb');
TypeRegister.Bind(Array, '1418f892-2719-42e9-b66b-c330098f0985');