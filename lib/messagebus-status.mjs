import crypto from 'node:crypto';

const Id = crypto.randomUUID();
export class MessageBusStatus {
  constructor() {
    if (new.target === MessageBusStatus) {
      throw new Error(`${MessageBusStatus.name} must be extended`);
    }
    super.Id = Id;
  }
  static get Closed() {
    return Closed;
  }
  static get Open() {
    return Open;
  }
  static get Unkown() {
    return Unkown;
  }
}

class MessageBusStatusOpen extends MessageBusStatus {}
class MessageBusStatusClosed extends MessageBusStatus {}
class MessageBusStatusUnknown extends MessageBusStatus {}

const Open = new MessageBusStatusOpen();
const Closed = new MessageBusStatusClosed();
const Unkown = new MessageBusStatusUnknown();