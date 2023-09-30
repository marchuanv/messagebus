import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Container } from './container.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
export class Envelope extends Container {
    /**
     * @param { Channel } channel
     * @param { Address } recipient
     * @param { Priority } priority
     * @param { MessageType } messageType
     */
    constructor(channel, recipient, priority, messageType) {
        super();
        Container.context = this;
        Container.reference = channel;
        Container.reference = recipient;
        Container.reference = priority;
        Container.reference = messageType;
    }
    /**
     * @returns { Address }
    */
    get recipient() {
        return Container.getReference(this, Address.prototype);
    }
}