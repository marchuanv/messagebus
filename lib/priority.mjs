import { Container } from "./container.mjs";
const highPriority = new HighPriority();
const mediumPriority = new MediumPriority();
const lowPriority = new LowPriority();
export class Priority extends Container {
    static get High() {
        return highPriority;
    }
    static get Medium() {
        return mediumPriority;
    }
    static get Low() {
        return lowPriority;
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