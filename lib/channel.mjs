import { Properties } from "./properties.mjs";
const properties = new Properties();
export class Channel {
    /**
     * @param { string } name
     * @param { Address } address
     */
    constructor(name, address) {
        properties.set(this, String.prototype, 'name', name);
        properties.set(this, Address.prototype, 'address', address);
    }
    get name() {
        return properties.get(this, String.prototype, 'name');
    }
    get address() {
        return properties.get(this, Address.prototype, 'address');
    }
}