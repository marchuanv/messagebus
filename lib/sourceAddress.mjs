import { Address } from "./address.mjs";
export class SourceAddress extends Address {
    /**
    * @param { string } hostName
    * @param { number } hostPort
    */
    constructor(hostName, hostPort) {
        super(hostName, hostPort);
    }
}