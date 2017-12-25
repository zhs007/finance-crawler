"use strict";

const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_JRJFUNDLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startTotalFundCrawler } = require('./totalfund');
const { startNewFundArchCrawler } = require('./fundarch');
// const { stocklistjsOptions } = require('./stocklistjs');

class TaskJRJFundList extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_JRJFUNDLIST, cfg);
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadJRJFund().then(() => {
            startTotalFundCrawler(async (crawler) => {
                let lstfund = FinanceMgr.singleton.getNewJRJFund();
                if (lstfund.length > 0) {
                    startNewFundArchCrawler(lstfund, async () => {});
                }
            });

            CrawlerMgr.singleton.start(true, false, async () => {
                await FinanceMgr.singleton.saveJRJFund();

                this.onEnd();
            }, true);
        });
    }
};

taskFactory.regTask(TASK_NAMEID_JRJFUNDLIST, (taskfactory, cfg) => {
    return new TaskJRJFundList(taskfactory, cfg);
});

exports.TaskJRJFundList = TaskJRJFundList;