import { Address } from "./address.mjs";
export class DestinationAddress extends Address {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super(hostName, hostPort);
    }
}