import { Container } from "./container.mjs";
const messageType = new DefaultMessageType();
export class MessageType extends Container {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        return messageType;
    }
}
class DefaultMessageType extends MessageType { }