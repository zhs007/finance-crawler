"use strict";

const { Task } = require('jarvis-task');
const { CrawlerMgr } = require('crawlercore');
const { TaskFactory_FC } = require('./taskfactory');
const { TASK_NAMEID_INITCRAWLERMGR } = require('./taskdef');

class TaskInitCrawlerMgr extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_INITCRAWLERMGR);

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
            this.onEnd();
        });
    }
};

TaskFactory_FC.singleton.addTask(TASK_NAMEID_INITCRAWLERMGR, (cfg) => {
    return new TaskInitCrawlerMgr(cfg);
});

exports.TaskInitCrawlerMgr = TaskInitCrawlerMgr;