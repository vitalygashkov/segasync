'use strict';

const { request } = require('undici');

const httpRequest = async (url, options) => {
  const { statusCode, headers, body } = await request(url, {
    bodyTimeout: 5000,
    headersTimeout: 5000,
    ...options,
  });
  const buffers = [];
  for await (const chunk of body) buffers.push(chunk);
  const data = Buffer.concat(buffers);
  return { statusCode, headers, data };
};

const sleep = async (seconds) =>
  new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));

const fetch = async (url, options) => {
  const RETRY_THRESHOLD = 3;
  let retryCount = 0;
  let error = null;
  let response = {};
  do {
    try {
      response = await httpRequest(url, options);
      if (response.statusCode !== 200) error = { message: `Status code: ${response.statusCode}` };
    } catch (e) {
      error = e;
    }
    if (response.statusCode !== 200) {
      retryCount++;
      await sleep(1);
    }
  } while (response.statusCode !== 200 && retryCount <= RETRY_THRESHOLD);

  if (response.statusCode === 200) return response;
  else throw Error(error?.message);
};

module.exports = { fetch };
