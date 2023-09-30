import { Container } from "./container.mjs";
const context = {};
export class MessageType extends Container {
    /**
     * @returns { DefaultMessageType }
    */
    static get Default() {
        const defaultMessageType = Container.getReference(context, DefaultMessageType.prototype);
        if (defaultMessageType) {
            return defaultMessageType;
        } else {
            const messageType = new DefaultMessageType();
            Container.setReference(this, messageType);
            return messageType;
        }
    }
}
class DefaultMessageType extends MessageType { }