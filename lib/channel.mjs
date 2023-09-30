import { Address } from "./address.mjs";
import { Container } from "./container.mjs";
export class Channel extends Container {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        super();
        Container.setProperty(this, { name });
        Container.setReference(this, address);
    }
    /**
    * @returns { String }
    */
    get name() {
        return Container.getProperty(this, { name: null }, String.prototype);
    }
    /**
    * @returns { Address }
    */
    get address() {
        return Container.getReference(this, Address.prototype);
    }
}