import { Properties } from "./properties.mjs";
const properties = new Properties();
export class MessageType {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        if (properties.has(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name)) {
            const { DefaultMessageType } = properties.get(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name);
            return DefaultMessageType;
        } else {
            const messageType = new DefaultMessageType();
            properties.set(DefaultMessageType, DefaultMessageType.prototype, DefaultMessageType.name, messageType);
        }
    }
}
class DefaultMessageType extends MessageType { }