"use strict";

const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_JRJFUNDNET } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startFundArchDayOffCrawler } = require('./fundarch');

class TaskJRJFundNet extends Task {
    constructor(cfg) {
        super(TASK_NAMEID_JRJFUNDNET, cfg);
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadJRJFund().then(() => {
            for (let fundcode in FinanceMgr.singleton.mapJRJFund) {
                let cf = FinanceMgr.singleton.mapJRJFund[fundcode];
                startFundArchDayOffCrawler(cf.code, this.cfg.dayoff, () => {});
            }

            CrawlerMgr.singleton.start(true, false, async () => {
                await FinanceMgr.singleton.saveJRJFund();

                this.onEnd();
            }, true);
        });
    }
};

taskFactory.regTask(TASK_NAMEID_JRJFUNDNET, (cfg) => {
    return new TaskJRJFundNet(cfg);
});

exports.TaskJRJFundNet = TaskJRJFundNet;