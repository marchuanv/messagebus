import { Container } from './container.mjs';
export class MessageBusStatus extends Container {
    static get Closed() {
        return Closed;
    }
    static get Open() {
      return Open;  
    }
}
const Open = new MessageBusStatus();
const Closed = new MessageBusStatus();