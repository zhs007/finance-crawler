"use strict";

const { Task } = require('jarvis-task');
const { TASK_NAMEID_FINANCEMAIN } = require('./taskdef');
const { FinanceMgr } = require('./financemgr');

const { TaskSSEStockList } = require('./sse/task_ssestocklist');

class TaskMain extends Task {
    constructor() {
        super(TASK_NAMEID_FINANCEMAIN);

        this.addChild(new TaskSSEStockList());
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init('').then(() => {
            this.onEnd();
        });
    }
};

exports.TaskMain = TaskMain;
