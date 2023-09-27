import { Properties } from '../lib/properties.mjs';
import { Address } from './address.mjs';
import { Channel } from './channel.mjs';
import { Message } from './message.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
import { TypeRegister } from './typeregister.mjs';
const properties = new Properties();
export class Envelope extends Message {
    /**
     * @param { Channel } channel
     * @param { Address } recipient
     * @param { Priority } priority
     * @param { MessageType } messageType
     */
    constructor(channel, recipient, priority, messageType) {
        super(channel, priority, messageType);
        properties.set(this, Address.prototype, 'recipient', recipient);
    }
    /**
     * @returns { Address }
    */
    get recipient() {
        return properties.get(this, Address.prototype, 'recipient');
    }
}
TypeRegister.Bind(Envelope, 'edf8829a-520f-42ac-880a-62258412106a');