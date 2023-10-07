import crypto from 'node:crypto';

export class TaskFlag {
    constructor(Id) {
        this.Id = Id;
    }
    /**
     * @returns { OnceOffTaskFlag }
    */
    static get OnceOff() {
        return onceOffTask;
    }
    /**
     * @returns { RepeatTaskFlag }
    */
    static get Repeat() {
        return repeatTask;
    }
    /**
     * @returns { IgnoreErrorsTaskFlag }
    */
    static get IgnoreErrors() {
        return ignoreErrors
    }
    /**
     * @returns { HandleErrorsTaskFlag }
    */
    static get HandleErrors() {
        return handleErrors;
    }
    /**
     * @returns { HighPriorityTaskFkag }
    */
    static get HighPriority() {
        return highPriority;
    }
    /**
     * @returns { MediumPriorityTaskFlag }
    */
    static get MediumPriority() {
        return mediumPriority;
    }
    /**
     * @returns { LowPriorityTaskFlag }
    */
    static get LowPriority() {
        return lowPriority;
    }
    /**
     * @returns { ValidResponseTaskFlag }
    */
    static get ValidResponse() {
        return validResponse;
    }
    /**
     * @returns { WaitForValidResponseTaskFlag }
    */
     static get WaitForValidResponse() {
        return waitForValidResponse;
    }
    /**
     * @returns { RepeatUntilValidResponseTaskFlag }
    */
     static get RepeatUntilValidResponse() {
        return repeatUntilValidResponseTaskFlag;
    }
}

export class HighPriorityTaskFkag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class MediumPriorityTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class LowPriorityTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class OnceOffTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class RepeatTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class IgnoreErrorsTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class HandleErrorsTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class ValidResponseTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class WaitForValidResponseTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}
export class RepeatUntilValidResponseTaskFlag extends TaskFlag { constructor(){ super(crypto.randomUUID()); }}

const highPriority = new HighPriorityTaskFkag();
const mediumPriority = new MediumPriorityTaskFlag();
const lowPriority = new LowPriorityTaskFlag();
const onceOffTask = new OnceOffTaskFlag();
const repeatTask = new RepeatTaskFlag();
const ignoreErrors = new IgnoreErrorsTaskFlag();
const handleErrors = new HandleErrorsTaskFlag();
const validResponse = new ValidResponseTaskFlag();
const waitForValidResponse = new WaitForValidResponseTaskFlag();
const repeatUntilValidResponseTaskFlag = new RepeatUntilValidResponseTaskFlag();
