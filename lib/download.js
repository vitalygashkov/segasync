'use strict';

const { join } = require('path');
const { Worker } = require('worker_threads');
const { Progress } = require('./progress');

const DEFAULT_PART_SIZE = 24;
const DEFAULT_FILEPATH = join(process.cwd(), 'mediafile');
const WORKER_PATH = join(__dirname, 'worker.js');
const workers = new Map();
const progress = new Progress();

const createWorker = (props) => {
  const { urls, filepath = DEFAULT_FILEPATH, headers, partSize = DEFAULT_PART_SIZE } = props;
  const worker = new Worker(WORKER_PATH, { workerData: { urls, filepath, headers, partSize } });
  workers.set(worker.threadId, worker);
  return worker;
};

const waitForWorker = async (worker, options) => {
  const { logger = console } = options;
  return new Promise((resolve, reject) => {
    worker.on('message', (message) => {
      const { type, level, content, value, threadId } = message;
      if (type === 'log') logger[level](content);
      if (type === 'progress') progress.increase(value);
      if (type === 'error') terminateWorkers().then(() => reject(new Error(message.content)));
      if (type === 'end') terminateWorkers([threadId]).then(() => resolve());
    });
  });
};

const terminateWorkers = async (ids = workers.keys()) => {
  for (const id of ids) {
    const worker = workers.get(id);
    await worker.terminate();
    workers.delete(id);
  }
};

const download = async (urls, options) => {
  progress.setSize(progress.size + urls.length);
  progress.setPrefix(options.logPrefix);
  const worker = createWorker({ urls, ...options });
  await waitForWorker(worker, options);
};

module.exports = { download };
