'use strict';

const { workerData, parentPort, threadId } = require('worker_threads');
const { createWriteStream } = require('fs');
const { fetch } = require('./http');

const { urls, filepath, headers, partSize } = workerData;

const downloadSegment = async (url, index) => {
  const options = { headers };
  const response = await fetch(url, options);
  return { data: response.data, index };
};

(async () => {
  const writeStream = createWriteStream(filepath);
  const partsCount = Math.ceil(urls.length / partSize);
  for (let partIndex = 0; partIndex < partsCount; partIndex++) {
    const startOffset = partIndex * partSize;
    const endOffset = startOffset + partSize;
    const partSegments = new Map();
    for (
      let segmentIndex = startOffset;
      segmentIndex < endOffset && segmentIndex < urls.length;
      segmentIndex++
    ) {
      const url = urls[segmentIndex];
      partSegments.set(segmentIndex, downloadSegment(url, segmentIndex));
    }

    const segments = [];
    try {
      const responses = await Promise.all(partSegments.values());
      for (const response of responses) segments[response.index - startOffset] = response.data;
    } catch (e) {
      parentPort.postMessage({
        type: 'error',
        content: e.message,
      });
    }

    try {
      const data = Buffer.concat(segments);
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
    partSegments.clear();
  }

  writeStream.end();
  parentPort.postMessage({ type: 'end', threadId });
})();
