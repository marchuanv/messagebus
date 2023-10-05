import crypto from 'node:crypto';
const Id = crypto.randomUUID();
export class MessageType {
    constructor() {
        super.Id = Id;
    }
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        return defaultMessageType;
    }
    static get All() {
        return [
            MessageType.Default
        ];
    }
}
export class DefaultMessageType extends MessageType { }
const defaultMessageType = new DefaultMessageType();