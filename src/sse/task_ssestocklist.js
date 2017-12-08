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

        for (let dbcfgname in this.cfg.mysqlcfg) {
            CrawlerMgr.singleton.addMysqlCfg(dbcfgname, this.cfg.mysqlcfg[dbcfgname]);
        }

        for (let crawlerkey in this.cfg.crawlercfg) {
            CrawlerMgr.singleton[crawlerkey] = this.cfg.crawlercfg[crawlerkey];
        }

        CrawlerMgr.singleton.init().then(() => {
            FinanceMgr.singleton.init(this.cfg.maindb);

            FinanceMgr.singleton.loadSSEStockBase().then(() => {
                startStockListCrawler(async (crawler) => {
                    if (crawler.options.typename == stocklistjsOptions.typename) {
                        await FinanceMgr.singleton.saveSSEStockBase();

                        this.onEnd();
                    }
                });

                CrawlerMgr.singleton.start(true, true, async () => {
                }, true);
            });
        });
    }
};

TaskFactory_FC.singleton.addTask(TASK_NAMEID_SSESTOCKLIST, (cfg) => {
    return new TaskSSEStockList(cfg);
});

exports.TaskSSEStockList = TaskSSEStockList;