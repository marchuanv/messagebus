import { Container } from "./container.mjs";
const highContext = {};
const mediumContext = {};
const lowContext = {};
export class Priority extends Container {
    static get High() {
        Container.context = highContext;
        let highPriority = Container.getReference(highContext, HighPriority.prototype);
        if (highPriority) {
            return highPriority;
        } else {
            highPriority = new HighPriority();
            Container.reference = highPriority;
            return highPriority;
        }
    }
    static get Medium() {
        Container.context = mediumContext;
        let mediumPriority = Container.getReference(mediumContext, MediumPriority.prototype);
        if (mediumPriority) {
            return mediumPriority;
        } else {
            mediumPriority = new MediumPriority();
            Container.reference = mediumPriority;
            return mediumPriority;
        }
    }
    static get Low() {
        Container.context = lowContext;
        let lowPriority = Container.getReference(lowContext, LowPriority.prototype);
        if (lowPriority) {
            return lowPriority;
        } else {
            lowPriority = new LowPriority();
            Container.reference = lowPriority;
            return lowPriority;
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