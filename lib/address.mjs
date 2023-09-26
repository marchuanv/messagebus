import crypto from 'node:crypto';
import { Properties } from "./properties.mjs";
import { Serialisable } from "./serialisable.mjs";
const properties = new Properties();
export class Address extends Serialisable {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super();
        properties.set(this, String.prototype, 'Id', crypto.randomUUID());
        properties.set(this, String.prototype, 'hostName', hostName);
        properties.set(this, Number.prototype, 'hostPort', hostPort);
    }
    /**
     * @returns { String }
    */
    //[decorate]
    get Id() {
        return properties.get(this, String.prototype, 'Id');
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