#!/usr/bin/env node
import { MessageType } from "../lib/messagetype.mjs";
import { Priority } from "../lib/priority.mjs";
import { MessageBusAdapter } from "../messagebus-adapter.mjs";
class DefaultMessageBusAdapter extends MessageBusAdapter {
    constructor(channelName, hostName, hostPort) {
        super(channelName, hostName, hostPort, Priority.High, MessageType.Default);
    }
    receiveMessage(message) {

    }
}
const defaultMessageBusAdapter = new DefaultMessageBusAdapter('global', 'localhost', 3000);
defaultMessageBusAdapter.send(Priority.High, { message: 'Hello World' });