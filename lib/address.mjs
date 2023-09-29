import { Properties } from "./properties.mjs";

import { TypeRegister } from "./typeregister.mjs";
import { Serialisable } from "./serialisable.mjs";
const properties = new Properties();
export class Address extends Serialisable {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super((reference) => {
            console.log();
        });
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
TypeRegister.Bind(Address, '8337317b-386e-4cf9-8738-78bd12f1ec92');