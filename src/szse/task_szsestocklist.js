"use strict";

const { Task, crawlercore } = require('jarvis-task');
let { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SZSESTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockListCrawler } = require('./stocklist');

class TaskSZSEStockList extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_SZSESTOCKLIST, cfg);
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadSZSEStockBase().then(() => {
            startStockListCrawler(async (crawler) => {
            });

            CrawlerMgr.singleton.start(true, false, async () => {
                await FinanceMgr.singleton.saveSZSEStockBase();

                this.onEnd();
            }, true);
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SZSESTOCKLIST, (cfg) => {
    return new TaskSZSEStockList(cfg);
});

exports.TaskSZSEStockList = TaskSZSEStockList;