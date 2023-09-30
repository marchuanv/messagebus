import { Container } from "./container.mjs";
export class MessageType extends Container {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        return messageType;
    }
}
class DefaultMessageType extends MessageType { }
const messageType = new DefaultMessageType();