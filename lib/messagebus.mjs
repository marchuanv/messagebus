import { Channel } from './channel.mjs';
import { Communication } from './communication.mjs';
import { Envelope } from './envelope.mjs';
import { Priority } from './priority.mjs';
import { Properties } from './properties.mjs';
const properties = new Properties();
export class MessageBus extends Communication {
    /**
     * @param { Envelope } envelope
     */
    constructor(envelope) {
        if (new.target === MessageBus) {
            throw new TypeError(`${MessageBus.name} is an abstract class`);
        }
        super(envelope.channel);
        properties.set(this, Envelope.prototype, 'envelope', envelope);
        properties.set(this, Function.prototype, 'receive', this.receive);
    }
    async send() {
        const envelope = properties.get(this, Envelope.prototype, 'envelope');
        const messageQueue = [];
        for (const priority of Priority.All) {
            switch (priority) {
                case Priority.High: {
                    const messages = envelope.findAll(envelope.channel, Priority.High);
                    for (const message of messages) {
                        messageQueue.push(message);
                    }
                    break;
                }
                case Priority.Medium: {
                    const messages = envelope.findAll(envelope.channel, Priority.Medium);
                    for (const message of messages) {
                        messageQueue.push(message);
                    }
                    break;
                }
                case Priority.Low: {
                    const messages = envelope.findAll(envelope.channel, Priority.Low);
                    for (const message of messages) {
                        messageQueue.push(message);
                    }
                    break;
                }
            }
        }
        for (const message of messageQueue) {
            await super.send(message);
        }
    }
    /**
    * @returns { Channel }
    */
    get channel() {
        return properties.get(this, Channel.prototype, 'channel');
    }
};