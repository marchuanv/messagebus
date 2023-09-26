import { Properties } from "./properties.mjs";
const properties = new Properties();
export class Address {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        properties.set(this, String.prototype, 'hostName', hostName);
        properties.set(this, Number.prototype, 'hostPort', hostPort);
    }
    /**
     * @returns { String }
    */
    get hostName() {
        return properties.get(this, String.prototype, 'hostName');
    }
    /**
     * @returns { Number }
    */
    get hostPort() {
        return properties.get(this, Number.prototype, 'hostPort');
    }
}