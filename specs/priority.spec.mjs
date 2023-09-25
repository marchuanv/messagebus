import { Priority } from "../lib/priority.mjs";
import { Properties } from "../lib/properties.mjs";
const properties = new Properties();
const context = {};
describe('when comparing priorities given',() => {
    it('should have equality', async () => {
       const comparison1 = Priority.High;
       const comparison2 = Priority.High;
       expect(comparison1).toBe(comparison2);
    });
    it('should NOT have equality', async () => {
        const comparison1 = Priority.High;
        const comparison2 = Priority.Low;
        expect(comparison1).not.toBe(comparison2);
     });
});