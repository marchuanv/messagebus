import { Properties } from "./properties.mjs";
const properties = new Properties();
export class Priority {
    static get High() {
        if (properties.has(HighPriority, HighPriority.prototype, HighPriority.name)) {
            const { obj } = properties.get(HighPriority, HighPriority.prototype, HighPriority.name);
            return obj;
        } else {
            const priority = new HighPriority();
            properties.set(HighPriority, HighPriority.prototype, HighPriority.name, priority);
            return priority;
        }
    }
    static get Medium() {
        if (properties.has(MediumPriority, MediumPriority.prototype, MediumPriority.name)) {
            const { obj } = properties.get(MediumPriority, MediumPriority.prototype, MediumPriority.name);
            return obj;
        } else {
            const priority = new MediumPriority();
            properties.set(MediumPriority, MediumPriority.prototype, MediumPriority.name, priority);
            return priority;
        }
    }
    static get Low() {
        if (properties.has(LowPriority, LowPriority.prototype, LowPriority.name)) {
            const { obj } = properties.get(LowPriority, LowPriority.prototype, LowPriority.name);
            return obj;
        } else {
            const priority = new LowPriority();
            properties.set(LowPriority, LowPriority.prototype, LowPriority.name, priority);
            return priority;
        }
    }
}
class HighPriority extends Priority { }
class MediumPriority extends Priority { }
class LowPriority extends Priority { }