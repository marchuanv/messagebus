import { Container } from "./container.mjs";
export class MessageType extends Container {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        return defaultMessageType;
    }
}
class DefaultMessageType extends MessageType { }
const defaultMessageType = new DefaultMessageType();