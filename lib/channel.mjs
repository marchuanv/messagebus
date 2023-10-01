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
    get name() {
        return Container.getProperty(this, { name: null }, String.prototype);
    }
    /**
     * @returns { SourceAddress }
    */
    get source() {
        return Container.getReference(this, SourceAddress.prototype);
    }
    /**
     * @returns { DestinationAddress }
    */
    get destination() {
        return Container.getReference(this, DestinationAddress.prototype);
    }
    /**
     * @returns { Boolean }
    */
    get isOpen() {
        return Container.getProperty(this, { isOpen: null }, Boolean.prototype);
    }
    close() {
        Container.setProperty(this, { isOpen: false });
    }
}