import { Container } from "./container.mjs";
export class Address extends Container {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super();
        Container.context = this;
        Container.property = { hostName };
        Container.property = { hostPort };
    }
    /**
     * @returns { String }
    */
    get hostName() {
        return Container.getProperty(this, { hostName: null }, String.prototype);
    }
    /**
     * @returns { Number }
    */
    get hostPort() {
        return Container.getProperty(this, { hostPort: null }, Number.prototype);
    }
}