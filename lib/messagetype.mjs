import { Properties } from "./properties.mjs";
import { Serialisable } from "./serialisable.mjs";
const properties = new Properties();
export class MessageType extends Serialisable {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        if (properties.has(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name)) {
            return properties.get(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name);
        } else {
            const messageType = new DefaultMessageType();
            properties.set(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name, messageType);
            return messageType;
        }
    }
}
class DefaultMessageType extends MessageType {
    constructor() {
        super();
    }
}