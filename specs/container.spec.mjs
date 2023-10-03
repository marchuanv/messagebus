import { Address } from '../lib/address.mjs';
import { Channel } from '../lib/channel.mjs';
import { Priority } from '../lib/priority.mjs';
describe('when creating an envelope', () => {
    it('should register with inherited container.', async () => {
        const priority = new Priority();
        const recipientAddress = new Address('localhost', 3000);
        const channel = new Channel('apples', recipientAddress);
    });
});