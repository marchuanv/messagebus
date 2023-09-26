import { Properties } from "./properties.mjs";
const properties = new Properties();
export class Priority {
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