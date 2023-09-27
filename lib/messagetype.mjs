import { Properties } from "./properties.mjs";
import { Serialisable } from "./serialisable.mjs";
import { TypeRegister } from "./typeregister.mjs";
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
TypeRegister.Bind(DefaultMessageType, 'cf08a920-4dd8-48fe-a419-1f7e5b2f1554');
TypeRegister.Bind(MessageType, 'b88e46da-75e3-41b4-9355-745f792ae8c5');