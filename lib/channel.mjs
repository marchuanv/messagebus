import { Container } from "./container.mjs";
import { DestinationAddress } from './destinationAddress.mjs';
import { SourceAddress } from './sourceAddress.mjs';
export class Channel extends Container {
    /**
     * @param { string } name
     * @param { SourceAddress } source
     * @param { DestinationAddress } destination
     * @param { Boolean? } isSecure
     */
    constructor(name, source, destination, isSecure = true) {
        super();
        Container.setProperty(this, { name });
        Container.setReference(this, source, SourceAddress.prototype);
        Container.setReference(this, destination, DestinationAddress.prototype);
        Container.setProperty(this, { isOpen: true });
        Container.setProperty(this, { isSecure });
    }
    /**
     * @returns { String }
    */
    async getName() {
        return await Container.getProperty(this, { name: null }, String.prototype);
    }
    /**
     * @returns { SourceAddress }
    */
    async getSource() {
        return await Container.getReference(this, SourceAddress.prototype);
    }
    /**
     * @returns { DestinationAddress }
    */
    async getDestination() {
        return await Container.getReference(this, DestinationAddress.prototype);
    }
    /**
     * @returns { Boolean }
    */
    async isOpen() {
        return await Container.getProperty(this, { isOpen: null }, Boolean.prototype);
    }
    /**
     * @returns { Boolean }
    */
    async isSecure() {
        return await Container.getProperty(this, { isSecure: null }, Boolean.prototype);
    }
    async close() {
        await Container.setProperty(this, { isOpen: false });
    }
    async open() {
        await Container.setProperty(this, { isOpen: true });
    }
}