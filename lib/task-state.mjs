import crypto from 'node:crypto';
const Id = crypto.randomUUID();
export class TaskState {
    /**
     * @param { String } Id
     */
    constructor(Id) {
        this.Id = Id;
    }
    static get Queued() {
        return queued;
    }
    static get CallbackReturned() {
        return callbackReturned;
    }
    static get Error() {
        return error;
    }
    static get Done() {
        return done;
    }
    static get Ready() {
        return ready;
    }
    static get CallbackStarted() {
        return callbackStarted;
    }
    static get LongRunning() {
        return longRunning;
    }
    static get PromiseResolvedWithResults() {
        return promiseResolvedWithResults;
    }
    static get PromiseResolvedNoResults() {
        return promiseResolvedNoResults;
    }
    static get PromiseResolved() {
        return promiseResolved;
    }
}
class QueuedTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class CallbackReturned extends TaskState { constructor() { super(crypto.randomUUID()); } }
class ErrorTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class DoneTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class ReadyTaskState extends TaskState { constructor() { super(crypto.randomUUID()); } }
class PromiseResolved extends TaskState { constructor() { super(crypto.randomUUID()); } }
class PromiseResolvedWithResults extends TaskState { constructor() { super(crypto.randomUUID()); } }
class PromiseResolvedNoResults extends TaskState { constructor() { super(crypto.randomUUID()); } }
class CallbackStarted extends TaskState { constructor() { super(crypto.randomUUID()); } }
class LongRunning extends TaskState { constructor() { super(crypto.randomUUID()); } }

const queued = new QueuedTaskState();
const callbackReturned = new CallbackReturned();
const error = new ErrorTaskState();
const done = new DoneTaskState();
const ready = new ReadyTaskState();
const callbackStarted = new CallbackStarted();
const longRunning = new LongRunning();
const promiseResolvedWithResults = new PromiseResolvedWithResults();
const promiseResolvedNoResults = new PromiseResolvedNoResults();
const promiseResolved = new PromiseResolved();