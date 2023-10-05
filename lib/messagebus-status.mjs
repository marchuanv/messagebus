import crypto from 'node:crypto';

const Id = crypto.randomUUID();
export class MessageBusStatus {
  constructor() {
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
const Open = new MessageBusStatus();
const Closed = new MessageBusStatus();
const Unkown = new MessageBusStatus();