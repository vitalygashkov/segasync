'use strict';

const process = require('node:process');

class Progress {
  constructor({ size = 0, label = '', logger = console } = {}) {
    this.label = label;
    this.size = size;
    this.sizeChars = 50;
    this.current = 0;
    this.stopped = false;
    this.prefix = 'getPrefix' in logger ? logger.getPrefix('info') : `[INFO]`;
  }

  setSize(size) {
    this.size = size;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  increase(value = 1) {
    this.update(this.current + value);
  }

  update(progress) {
    if (this.stopped) return;
    if (progress) this.current = progress;
    else this.current++;
    const progressPercents = parseInt(((this.current * 100) / this.size).toFixed(0));
    const progressChars = parseInt(((this.current * this.sizeChars) / this.size).toFixed(0));
    const emptyRepeatTimes = progressChars > this.sizeChars ? 0 : this.sizeChars - progressChars;
    const dots = '█'.repeat(progressChars);
    const empty = '▒'.repeat(emptyRepeatTimes);
    const label = this.label ? ` ${this.label} ` : ' ';
    process.stdout.write(`\r${this.prefix}${label}${dots}${empty} ${progressPercents}%`);
    if (this.current >= this.size) this.stop();
  }

  stop() {
    process.stdout.write(`\n`);
    this.stopped = true;
  }
}

module.exports = { Progress };
