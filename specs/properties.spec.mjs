import { Properties } from "../lib/properties.mjs";
const properties = new Properties();
const context = {};
describe('when creating a property given a context with a name and value',() => {
    it('should so without error', async () => {
        const _hostName = 'localhost';
        const _hostPort = 3000;
        properties.set(context, String.prototype, 'hostName', _hostName);
        properties.set(context, Number.prototype, 'hostPort', _hostPort);
        const hostName = properties.get(context, String.prototype, 'hostName');
        const hostPort = properties.get(context, Number.prototype, 'hostPort');
        expect(hostName).toBe(_hostName);
        expect(hostPort).toBe(_hostPort);
    });
});