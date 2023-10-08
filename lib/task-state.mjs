import crypto from 'node:crypto';
const Id = crypto.randomUUID();
export class TaskState {
    constructor() {
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
class QueuedTaskState extends TaskState { }
class CallbackReturned extends TaskState { }
class ErrorTaskState extends TaskState { }
class DoneTaskState extends TaskState { }
class ReadyTaskState extends TaskState { }
class PromiseResolved extends TaskState { }
class PromiseResolvedWithResults extends TaskState { }
class PromiseResolvedNoResults extends TaskState { }
class CallbackStarted extends TaskState { }
class LongRunning extends TaskState { }

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