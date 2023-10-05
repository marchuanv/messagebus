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
        super.setProperty({ name });
        super.setReference(source, SourceAddress.prototype);
        super.setReference(destination, DestinationAddress.prototype);
        super.setProperty({ isOpen: true });
        super.setProperty({ isSecure });
    }
    /**
     * @returns { String }
    */
    async getName() {
        return await super.getProperty({ name: null }, String.prototype);
    }
    /**
     * @returns { SourceAddress }
    */
    async getSource() {
        return await super.getReference(SourceAddress.prototype);
    }
    /**
     * @returns { DestinationAddress }
    */
    async getDestination() {
        return await super.getReference(DestinationAddress.prototype);
    }
    /**
     * @returns { Boolean }
    */
    async isOpen() {
        return await super.getProperty({ isOpen: null }, Boolean.prototype);
    }
    /**
     * @returns { Boolean }
    */
    async isSecure() {
        return await super.getProperty({ isSecure: null }, Boolean.prototype);
    }
    async close() {
        await super.setProperty({ isOpen: false });
    }
    async open() {
        await super.setProperty({ isOpen: true });
    }
}