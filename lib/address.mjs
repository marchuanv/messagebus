import { Container } from "./container.mjs";
export class Address extends Container {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super();
        super.setProperty({ hostName });
        super.setProperty({ hostPort });
    }
    /**
     * @returns { String }
    */
    async getHostName() {
        return await super.getProperty({ hostName: null }, String.prototype);
    }
    /**
     * @returns { Number }
    */
    async getHostPort() {
        return await super.getProperty({ hostPort: null }, Number.prototype);
    }
}