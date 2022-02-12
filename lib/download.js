const { join } = require('path');
const { Worker } = require('worker_threads');
const { ProgressBar } = require('./progress-bar');

class Download {
  constructor({ logger } = {}) {
    this.logger = logger || console;
    this.workers = new Map();
    this.progress = new ProgressBar({ logger });
  }

  add({ urls, filepath, headers, partSize }) {
    this.progress.setSize(this.progress.size + urls.length);
    const workerData = { urls, filepath, headers, partSize };
    const workerPath = join(__dirname, 'stream-worker.js');
    const worker = new Worker(workerPath, { workerData });
    this.workers.set(worker.threadId, worker);
  }

  logListener(level, content) {
    this.logger[level](content);
  }

  progressListener(value) {
    this.progress.increase(value);
  }

  async waitForEnd() {
    return new Promise((resolve, reject) => {
      for (const [threadId, worker] of this.workers)
        worker.on('message', (message) => {
          switch (message.type) {
            case 'log':
              this.logListener(message.level, message.content);
              break;
            case 'progress':
              this.progressListener(message.value);
              break;
            case 'error':
              for (const [threadId, worker] of this.workers) worker.terminate();
              reject(new Error(message.content));
              break;
            case 'end':
              worker.terminate().then(() => {
                this.workers.delete(message.threadId);
                if (!this.workers.size) resolve();
              });
              break;
            default:
              break;
          }
        });
    });
  }
}

module.exports = { Download };
