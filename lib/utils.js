'use strict';

const sleep = async (seconds) =>
  new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));

module.exports = { sleep };
