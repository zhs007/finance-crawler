"use strict";

const fs = require('fs');
const process = require('process');
const { startTask } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

const cfg = JSON.parse(fs.readFileSync('./initlist.json').toString());

startTask(cfg, taskFactory, () => {
    process.exit(0);
});