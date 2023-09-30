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
        Container.setReference(this, channel);
        Container.setReference(this, recipient);
        Container.setReference(this, priority);
        Container.setReference(this, messageType);
    }
    /**
     * @returns { Address }
    */
    get recipient() {
        return Container.getReference(this, Address.prototype);
    }
}