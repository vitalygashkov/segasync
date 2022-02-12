'use strict';

const { workerData, parentPort, threadId } = require('worker_threads');
const { createWriteStream } = require('fs');
const { request } = require('undici');

const RETRY_THRESHOLD = 3;
const DEFAULT_PART_SIZE = 32;
const { urls, filepath, headers, partSize = DEFAULT_PART_SIZE } = workerData;

const makeRequest = async (url, options) => {
  const { statusCode, headers, body } = await request(url, {
    ...options,
    bodyTimeout: 5000,
    headersTimeout: 5000,
  });
  const buffers = [];
  for await (const chunk of body) buffers.push(chunk);
  const data = Buffer.concat(buffers);
  return { statusCode, headers, data };
};

const downloadFragment = async (url, index) => {
  const options = { headers };
  let errorMessage = '';
  let response = {};

  try {
    response = await makeRequest(url, options);
  } catch (e) {
    errorMessage = e.message;
  }

  let retryCount = 0;
  while (response.statusCode !== 200 && retryCount < RETRY_THRESHOLD) {
    parentPort.postMessage({
      type: 'log',
      level: 'debug',
      content: `Download fragment #${index} failed. Code: ${
        response.statusCode || 'Exception'
      }. Retry...`,
    });
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));
    response = await makeRequest(url);
    retryCount++;
  }

  if (response.statusCode === 200) return { data: response.data, index };
  else throw Error(errorMessage);
};

(async () => {
  const writeStream = createWriteStream(filepath);
  const partsCount = Math.ceil(urls.length / partSize);
  for (let partIndex = 0; partIndex < partsCount; partIndex++) {
    const startOffset = partIndex * partSize;
    const endOffset = startOffset + partSize;
    const partFragments = new Map();
    for (
      let fragmentIndex = startOffset;
      fragmentIndex < endOffset && fragmentIndex < urls.length;
      fragmentIndex++
    ) {
      const url = urls[fragmentIndex];
      partFragments.set(fragmentIndex, downloadFragment(url, fragmentIndex));
    }

    const fragments = [];
    try {
      const responses = await Promise.all(partFragments.values());
      for (const response of responses) fragments[response.index - startOffset] = response.data;
    } catch (e) {
      parentPort.postMessage({
        type: 'error',
        content: e.message,
      });
    }

    try {
      const data = Buffer.concat(fragments);
      await new Promise((resolve) => writeStream.write(data, () => resolve()));
      const progress =
        endOffset > urls.length ? urls.length - startOffset : endOffset - startOffset;
      parentPort.postMessage({ type: 'progress', value: progress });
    } catch (e) {
      parentPort.postMessage({
        type: 'error',
        content: `Write part ${partIndex + 1} failed`,
      });
    }
    partFragments.clear();
  }

  writeStream.end();
  parentPort.postMessage({ type: 'end', threadId });
})();
