"use strict";

const fs = require('fs');
const process = require('process');
const { startTask } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

const cfg = JSON.parse(fs.readFileSync('./sinainitlist.json').toString());

startTask(cfg, taskFactory, () => {
    process.exit(0);
});