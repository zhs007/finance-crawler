"use strict";

const { TaskFactory, regTaskFactory_InitCrawlerMgr } = require('jarvis-task');
const { TASKFACTORY_NAMEID_FINANCEMAIN } = require('./taskdef');

let taskFactory = new TaskFactory(TASKFACTORY_NAMEID_FINANCEMAIN);
regTaskFactory_InitCrawlerMgr(taskFactory);

exports.taskFactory = taskFactory;
