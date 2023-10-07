import crypto from 'node:crypto';
const Id = crypto.randomUUID();
export class TaskState {
    constructor() {
        this.Id = Id;
    }
    static get Queued() {
        return queued;
    }
    static get CallbackCompleted() {
        return callbackCompleted;
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
    static get PromiseResolved() {
        return promiseResolved;
    }
    static get CallbackStarted() {
        return callbackStarted;
    }
    static get LongRunning() {
        return longRunning;
    }
}
class QueuedTaskState extends TaskState { }
class CallbackCompleted extends TaskState { }
class ErrorTaskState extends TaskState { }
class DoneTaskState extends TaskState { }
class ReadyTaskState extends TaskState { }
class PromiseResolved extends TaskState { }
class CallbackStarted extends TaskState { }
class LongRunning extends TaskState { }

const queued = new QueuedTaskState();
const callbackCompleted = new CallbackCompleted();
const error = new ErrorTaskState();
const done = new DoneTaskState();
const ready = new ReadyTaskState();
const promiseResolved = new PromiseResolved();
const callbackStarted = new CallbackStarted();
const longRunning = new LongRunning();