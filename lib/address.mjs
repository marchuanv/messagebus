import { Container } from "./container.mjs";
export class Address extends Container {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super();
        Container.setProperty(this, { hostName });
        Container.setProperty(this, { hostPort });
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