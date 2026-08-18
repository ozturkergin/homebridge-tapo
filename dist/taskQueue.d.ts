import type { Logging } from 'homebridge';
export declare class TaskQueue {
    private queue;
    private running;
    private log;
    private resolveEmptyQueue;
    private isShuttingDownRef;
    constructor(log: Logging, isShuttingDownRef: () => boolean);
    addTask(task: () => Promise<void>): void;
    private processQueue;
    waitForEmptyQueue(): Promise<void>;
}
