"use strict";

const fs = require('fs');
const { startTaskDeamon } = require('jarvis-task');
const { taskFactory } = require('../src/taskfactory');
require('../src/alltask');

const cfg = JSON.parse(fs.readFileSync('./taskdeamon.json').toString());

startTaskDeamon(cfg, taskFactory);