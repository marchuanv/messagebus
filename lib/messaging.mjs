import { ChannelMessageQueue } from "./channel-message-queue.mjs";
import { Channel } from "./channel.mjs";
import { Container } from "./container.mjs";
import { MessageBus } from "./messagebus.mjs";
import { Priority } from "./priority.mjs";
export class Messaging extends Container {
    /**
     * @param { ChannelMessageQueue } channelMessageQueue
     */
    constructor(channelMessageQueue) {
        if (new.target === Messaging) {
            throw new TypeError(`${Messaging.name} should be extended.`);
        }
        super();
        Container.setReference(this, channelMessageQueue);
    }
    /**
     * @param { Priority } priority
     * @param { Object } data
     */
    publish(priority, data) {
        const channelMessageQueue = Container.getReference(this, ChannelMessageQueue.prototype);
    }
    /**
     * @returns { MessageBus }
     */
    get subscribe() {
        const channelMessageQueue = Container.getReference(this, ChannelMessageQueue.prototype);
    }
}