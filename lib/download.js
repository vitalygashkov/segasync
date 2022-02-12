'use strict';

const { join } = require('path');
const { Worker } = require('worker_threads');
const { Progress } = require('./progress');

const DEFAULT_PART_SIZE = 32;
const WORKER_PATH = join(__dirname, 'worker.js');
const workers = new Map();
const progress = new Progress();

const download = async (urls, options) => {
  const { filepath, headers, partSize = DEFAULT_PART_SIZE, logger, logPrefix } = options;
  progress.setSize(progress.size + urls.length);
  progress.setPrefix(logPrefix);
  const workerData = { urls, filepath, headers, partSize };
  const worker = new Worker(WORKER_PATH, { workerData });
  workers.set(worker.threadId, worker);

  await new Promise((resolve, reject) => {
    worker.on('message', (message) => {
      const { type, level, content, value, threadId } = message;
      if (type === 'log') logger[level](content);
      if (type === 'progress') progress.increase(value);
      if (type === 'error') {
        for (const worker of workers.values()) worker.terminate();
        workers.clear();
        reject(new Error(message.content));
      }
      if (type === 'end') worker.terminate().then(() => resolve(workers.delete(threadId)));
    });
  });
};

module.exports = { download };
