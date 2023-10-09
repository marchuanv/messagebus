import crypto from 'node:crypto';

const Id = crypto.randomUUID();
export class MessageBusStatus {
  constructor() {
    if (new.target === MessageBusStatus) {
      throw new Error(`${MessageBusStatus.name} must be extended`);
    }
    super.Id = Id;
  }
  static get ClientClosed() {
    return ClientClosed;
  }
  static get ClientOpen() {
    return ClientOpen;
  }
  static get ServerClosed() {
    return ServerClosed;
  }
  static get ServerOpen() {
    return ServerOpen;
  }
  static get Unkown() {
    return Unkown;
  }
  static get Ready() {
    return Ready;
  }
}

class MessageBusStatusOpen extends MessageBusStatus { }
class MessageBusStatusClosed extends MessageBusStatus { }
class MessageBusStatusUnknown extends MessageBusStatus { }
class MessageBusStatusReady extends MessageBusStatus { }

const ClientOpen = new MessageBusStatusOpen();
const ClientClosed = new MessageBusStatusClosed();
const ServerOpen = new MessageBusStatusOpen();
const ServerClosed = new MessageBusStatusClosed();
const Unkown = new MessageBusStatusUnknown();
const Ready = new MessageBusStatusReady();