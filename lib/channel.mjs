import { Address } from "./address.mjs";
import { Properties } from "./properties.mjs";
import { Serialisable } from "./serialisable.mjs";
import { TypeRegister } from "./typeregister.mjs";
const properties = new Properties();
export class Channel extends Serialisable {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        super();
        properties.set(this, String.prototype, 'name', name);
        properties.set(this, Address.prototype, 'address', address);
    }
    /**
    * @returns { String }
    */
    get name() {
        return properties.get(this, String.prototype, 'name');
    }
    /**
    * @returns { Address }
    */
    get address() {
        return properties.get(this, Address.prototype, 'address');
    }
}
TypeRegister.Bind(Channel, '6f65d180-2553-4bee-a747-73dd88b2feac');