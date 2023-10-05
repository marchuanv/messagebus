import crypto from 'node:crypto';
import { Container } from "./container.mjs";
const Id = crypto.randomUUID();
export class MessageBusStatus extends Container {
  constructor() {
    super();
    super.Id = Id;
  }
  static get Closed() {
    return Closed;
  }
  static get Open() {
    return Open;
  }
}
const Open = new MessageBusStatus();
const Closed = new MessageBusStatus();