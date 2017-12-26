"use strict";

const moment = require('moment');
const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SINASTOCKTODAY } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockToday2Crawler_List } = require('./stocktoday');
// const { stocklistjsOptions } = require('./stocklistjs');

class TaskSinaStockToday extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_SINASTOCKTODAY, cfg);
    }

    onStart() {
        super.onStart();

        let today = moment().format('YYYY-MM-DD');
        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadSinaStock().then(() => {
            FinanceMgr.singleton.fixSinaStockToday(today).then(() => {
                FinanceMgr.singleton.getSinaTodayStock(today).then((lst) => {
                    let rlst = FinanceMgr.singleton.reselectSinaStock(lst);
                    startStockToday2Crawler_List(rlst, this.cfg.headlesschromename, () => {});

                    CrawlerMgr.singleton.start(true, false, () => {
                        this.onEnd();
                    }, true);
                });
            });
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SINASTOCKTODAY, (taskfactory, cfg) => {
    return new TaskSinaStockToday(taskfactory, cfg);
});

exports.TaskSinaStockToday = TaskSinaStockToday;