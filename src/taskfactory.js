"use strict";

const { TaskFactory } = require('jarvis-task');
const { TASKFACTORY_NAMEID_FINANCEMAIN } = require('./taskdef');
const { FinanceMgr } = require('./financemgr');

class TaskFactory_FC extends TaskFactory {
    constructor() {
        super(TASKFACTORY_NAMEID_FINANCEMAIN);
    }
};

TaskFactory_FC.singleton = new TaskFactory_FC();

exports.TaskFactory_FC = TaskFactory_FC;
