import crypto from 'node:crypto';
const Id = crypto.randomUUID();
export class TaskState {
    constructor() {
        this.Id = Id;
    }
    static get Queued() {
        return queued;
    }
    static get Locked() {
        return locked;
    }
    static get ExecutionStarted() {
        return executionStarted;
    }
    static get ExecutionCompleted() {
        return executionCompleted;
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
    static get Blocked() {
        return blocked;
    }
}
class QueuedTaskState extends TaskState { }
class ExecutionStartedTaskState extends TaskState { }
class ExecutionCompletedTaskState extends TaskState { }
class ErrorTaskState extends TaskState { }
class DoneTaskState extends TaskState { }
class ReadyTaskState extends TaskState { }
class LockedTaskState extends TaskState { }
class BlockedTaskState extends TaskState { }

const queued = new QueuedTaskState();
const executionStarted = new ExecutionStartedTaskState();
const executionCompleted = new ExecutionCompletedTaskState();
const error = new ErrorTaskState();
const done = new DoneTaskState();
const ready = new ReadyTaskState();
const locked = new LockedTaskState();
const blocked = new BlockedTaskState();