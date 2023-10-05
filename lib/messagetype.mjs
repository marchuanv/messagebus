import crypto from 'node:crypto';
import { Container } from "./container.mjs";
const Id = crypto.randomUUID();
export class MessageType extends Container {
    constructor() {
        super();
        super.Id = Id;
    }
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        return defaultMessageType;
    }
}
export class DefaultMessageType extends MessageType { }
const defaultMessageType = new DefaultMessageType();