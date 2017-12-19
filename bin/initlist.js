"use strict";

const fs = require('fs');
const process = require('process');
const { startTaskChain } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

const cfg = JSON.parse(fs.readFileSync('./config.json').toString());

startTaskChain(cfg, taskFactory, () => {

});