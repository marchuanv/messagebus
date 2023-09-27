import { Properties } from "./properties.mjs";
import { Serialisable } from "./serialisable.mjs";
import { TypeRegister } from "./typeregister.mjs";
const properties = new Properties();
export class Priority extends Serialisable {
    static get High() {
        if (properties.has(HighPriority, HighPriority.prototype, HighPriority.name)) {
            return properties.get(HighPriority, HighPriority.prototype, HighPriority.name);
        } else {
            const priority = new HighPriority();
            properties.set(HighPriority, HighPriority.prototype, HighPriority.name, priority);
            return priority;
        }
    }
    static get Medium() {
        if (properties.has(MediumPriority, MediumPriority.prototype, MediumPriority.name)) {
            return properties.get(MediumPriority, MediumPriority.prototype, MediumPriority.name);
        } else {
            const priority = new MediumPriority();
            properties.set(MediumPriority, MediumPriority.prototype, MediumPriority.name, priority);
            return priority;
        }
    }
    static get Low() {
        if (properties.has(LowPriority, LowPriority.prototype, LowPriority.name)) {
            return properties.get(LowPriority, LowPriority.prototype, LowPriority.name);
        } else {
            const priority = new LowPriority();
            properties.set(LowPriority, LowPriority.prototype, LowPriority.name, priority);
            return priority;
        }
    }
    static get All() {
        return [
            Priority.High,
            Priority.Medium,
            Priority.Low
        ];
    }
}
class HighPriority extends Priority { }
class MediumPriority extends Priority { }
class LowPriority extends Priority { }

TypeRegister.Bind(HighPriority, '04d08753-e93a-41e5-8117-4b1c6a75d2f4');
TypeRegister.Bind(MediumPriority, 'f6fbdf99-e8fb-48c8-9111-79f31e37dc2b');
TypeRegister.Bind(LowPriority, '8a6539c5-4861-42e4-9884-d688a268033a');
TypeRegister.Bind(Priority, '109b4c73-57c4-4b14-b703-28edfa2190b5');