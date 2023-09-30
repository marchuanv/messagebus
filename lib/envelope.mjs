import { Channel } from './channel.mjs';
import { Message } from './message.mjs';
import { MessageType } from './messagetype.mjs';
import { Priority } from './priority.mjs';
export class Envelope extends Message {
    /**
     * @param { Channel } channel
     * @param { Priority } priority
     * @param { MessageType } messageType
     */
    constructor(channel, priority, messageType) {
        super(channel, priority, messageType);
    }
}