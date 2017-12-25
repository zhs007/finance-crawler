"use strict";

const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SSESTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockListCrawler } = require('./stocklist');
const { stocklistjsOptions } = require('./stocklistjs');

class TaskSSEStockList extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_SSESTOCKLIST, cfg);
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadSSEStockBase().then(() => {
            startStockListCrawler(async (crawler) => {
                if (crawler.options.typename == stocklistjsOptions.typename) {
                }
            });

            CrawlerMgr.singleton.start(true, false, async () => {
                await FinanceMgr.singleton.saveSSEStockBase();

                this.onEnd();
            }, true);
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SSESTOCKLIST, (taskfactory, cfg) => {
    return new TaskSSEStockList(taskfactory, cfg);
});

exports.TaskSSEStockList = TaskSSEStockList;