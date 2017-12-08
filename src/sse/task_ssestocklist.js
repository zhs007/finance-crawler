"use strict";

const { Task } = require('jarvis-task');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_FC } = require('../taskfactory');
const { TASK_NAMEID_SSESTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockListCrawler } = require('./stocklist');
const { stocklistjsOptions } = require('./stocklistjs');

class TaskSSEStockList extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_SSESTOCKLIST);

        this.cfg = cfg;
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

TaskFactory_FC.singleton.addTask(TASK_NAMEID_SSESTOCKLIST, (cfg) => {
    return new TaskSSEStockList(cfg);
});

exports.TaskSSEStockList = TaskSSEStockList;