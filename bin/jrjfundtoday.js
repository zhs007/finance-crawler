"use strict";

const fs = require('fs');
const util = require('util');
const moment = require('moment');
const process = require('process');
const { startTask, initDailyRotateFileLog } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

initDailyRotateFileLog(util.format('./log/jrjfundtoday_%d.log', moment().format('x')), 'info');

const cfg = JSON.parse(fs.readFileSync('./jrjfundtoday.json').toString());

startTask(cfg, taskFactory, () => {
    process.exit(0);
});