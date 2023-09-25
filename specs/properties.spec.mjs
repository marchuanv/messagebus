import { Properties } from "../lib/properties.mjs";
const properties = new Properties();
const context = {};
describe('when creating a property given a context with a name and value',() => {
    it('should so without error', async () => {
        const hostName = 'localhost';
        const hostPort = 3000;
        properties.set(context, String.prototype, { hostName });
        properties.set(context, Number.prototype, { hostPort });
        {
            const { obj } = properties.get(context, String.prototype, 'hostName');
            expect(obj).toBe(hostName);
        }
        {
            const { obj } = properties.get(context, Number.prototype, 'hostPort');
            expect(obj).toBe(hostPort);
        }
    });
});