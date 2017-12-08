"use strict";

const { Task } = require('jarvis-task');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_FC } = require('../taskfactory');
const { TASK_NAMEID_SZSESTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockListCrawler } = require('./stocklist');

class TaskSZSEStockList extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_SZSESTOCKLIST);

        this.cfg = cfg;
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

TaskFactory_FC.singleton.addTask(TASK_NAMEID_SZSESTOCKLIST, (cfg) => {
    return new TaskSZSEStockList(cfg);
});

exports.TaskSZSEStockList = TaskSZSEStockList;