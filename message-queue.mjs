import { Adapter } from './adapter.mjs';
import { Container } from "./lib/container.mjs";
export class MessageQueue extends Container {
    /**
     * @param { Adapter } adapter
     */
    constructor(adapter) {
        if (new.target === Messaging) {
            throw new TypeError(`${Messaging.name} should be extended`);
        }
    }