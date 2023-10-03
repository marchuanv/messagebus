import { Container } from "./container.mjs";
import { DestinationAddress } from './destinationAddress.mjs';
import { SourceAddress } from './sourceAddress.mjs';
export class Channel extends Container {
    /**
     * @param { string } name
     * @param { SourceAddress } source
     * @param { DestinationAddress } destination
     */
    constructor(name, source, destination) {
        super();
        Container.setProperty(this, { name });
        Container.setReference(this, source);
        Container.setReference(this, destination);
        Container.setProperty(this, { isOpen: true });
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
    async close() {
        await Container.setProperty(this, { isOpen: false });
    }
    async open() {
        await Container.setProperty(this, { isOpen: true });
    }
}