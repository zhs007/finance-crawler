"use strict";

const moment = require('moment');
const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SINASTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
// const { startTotalFundCrawler } = require('./totalfund');
const { startStockListNumsCrawler } = require('./stocklistnums');

class TaskSinaStockList extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_SINASTOCKLIST, cfg);
    }

    onStart() {
        super.onStart();

        let today = moment().format('YYYY-MM-DD');
        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadSinaStock().then(() => {

            startStockListNumsCrawler(() => {});

            CrawlerMgr.singleton.start(true, false, async () => {
                await FinanceMgr.singleton.saveSinaStock();

                this.onEnd();
            }, true);
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SINASTOCKLIST, (taskfactory, cfg) => {
    return new TaskSinaStockList(taskfactory, cfg);
});

exports.TaskSinaStockList = TaskSinaStockList;