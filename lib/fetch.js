'use strict';

const { request } = require('undici');
const { sleep } = require('./utils');

const RETRY_THRESHOLD = 3;

const receiveData = async (body) => {
  const buffers = [];
  for await (const chunk of body) buffers.push(chunk);
  return Buffer.concat(buffers);
};

const httpRequest = async (url, options = {}) => {
  const { statusCode, headers, body } = await request(url, {
    bodyTimeout: 5000,
    headersTimeout: 5000,
    ...options,
  });
  const data = await receiveData(body);
  return { statusCode, headers, data };
};

const fetch = async (url, options) => {
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
