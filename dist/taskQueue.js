export class TaskQueue {
    queue = [];
    running = false;
    log;
    resolveEmptyQueue = null;
    isShuttingDownRef;
    constructor(log, isShuttingDownRef) {
        this.log = log;
        this.isShuttingDownRef = isShuttingDownRef;
    }
    addTask(task) {
        if (this.isShuttingDownRef && this.isShuttingDownRef()) {
            this.log.warn('TaskQueue: Attempted to add a task after shutdown started. Task rejected.');
            return;
        }
        this.queue.push(task);
        this.processQueue();
    }
    async processQueue() {
        if (this.running) {
            return;
        }
        this.running = true;
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                try {
                    await task();
                }
                catch (error) {
                    this.log.error('Error processing task:', error);
                }
            }
        }
        this.running = false;
        if (this.resolveEmptyQueue) {
            this.resolveEmptyQueue();
            this.resolveEmptyQueue = null;
        }
    }
    async waitForEmptyQueue() {
        if (this.queue.length === 0 && !this.running) {
            return;
        }
        return new Promise((resolve) => {
            this.resolveEmptyQueue = resolve;
        });
    }
}
//# sourceMappingURL=taskQueue.js.map