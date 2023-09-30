import { Address } from '../lib/address.mjs';
import { Channel } from '../lib/channel.mjs';
import { Envelope } from '../lib/envelope.mjs';
import { Priority } from '../lib/priority.mjs';
fdescribe('when creating an envelope', () => {
    it('should register with inherited container.', async () => {
        const priority = new Priority();
        const recipientAddress = new Address('localhost', 3000);
        const channel = new Channel('apples', recipientAddress);
        const envelope = new Envelope(channel, recipientAddress, priority);
    });
});