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
    async getHostName() {
        return await Container.getProperty(this, { hostName: null }, String.prototype);
    }
    /**
     * @returns { Number }
    */
    async getHostPort() {
        return await Container.getProperty(this, { hostPort: null }, Number.prototype);
    }
}