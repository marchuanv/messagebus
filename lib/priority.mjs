import { Container } from "./container.mjs";
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
export class HighPriority extends Priority { }
export class MediumPriority extends Priority { }
export class LowPriority extends Priority { }
const highPriority = new HighPriority();
const mediumPriority = new MediumPriority();
const lowPriority = new LowPriority();