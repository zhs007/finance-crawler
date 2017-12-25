"use strict";

const moment = require('moment');
const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SINASTOCKTODAY } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
// const { startTotalFundCrawler } = require('./totalfund');
// const { stocklistjsOptions } = require('./stocklistjs');

class TaskSinaStockToday extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_SINASTOCKTODAY, cfg);
    }

    onStart() {
        super.onStart();

        let today = moment().format('YYYY-MM-DD');
        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.fixSinaStockToday(today).then(() => {
            this.onEnd();
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SINASTOCKTODAY, (taskfactory, cfg) => {
    return new TaskSinaStockToday(taskfactory, cfg);
});

exports.TaskSinaStockToday = TaskSinaStockToday;