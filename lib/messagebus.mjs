import { Channel } from './channel.mjs';
import { Communication } from './communication.mjs';
import { Container } from './container.mjs';
import { Envelope } from './envelope.mjs';
import { Priority } from './priority.mjs';
import { Properties } from './properties.mjs';
const properties = new Properties();
export class MessageBus extends Communication {
    /**
     * @param { Server } httpServer
     * @param { Envelope } envelope
     */
    constructor(httpServer, envelope) {
        if (new.target === MessageBus) {
            throw new TypeError(`${MessageBus.name} is an abstract class`);
        }
        super(httpServer, envelope.channel);
        Container.context = this;
        Container.reference = envelope;
        Container.reference = this.receive;
    }
    async send() {
        const envelope = Container.get(this, Envelope.prototype);
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
        await super.send(envelope);
    }
    /**
    * @returns { Channel }
    */
    get channel() {
        return Container.get(this, Channel.prototype);
    }
};