"use strict";

const moment = require('moment');
const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_SINASTOCKJYMXTODAY } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startJYMX2Crawler_day } = require('./stockjymx');
// const { stocklistjsOptions } = require('./stocklistjs');

class TaskSinaStockJYMXToday extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_SINASTOCKJYMXTODAY, cfg);
    }

    onStart() {
        super.onStart();

        let today = moment().format('YYYY-MM-DD');
        // let today = '2018-02-05';
        FinanceMgr.singleton.init(this.cfg.maindb);

        FinanceMgr.singleton.loadSinaStock().then(async () => {

            let curlst = await FinanceMgr.singleton.countSinaJYMXList(today);
            let rlst = FinanceMgr.singleton.reselectSinaStock(curlst);

            // FinanceMgr.singleton.fixSinaStockToday(today).then(() => {
            //     FinanceMgr.singleton.getSinaTodayStock(today).then((lst) => {
            //         let rlst = FinanceMgr.singleton.reselectSinaStock(lst);
            //         startStockToday2Crawler_List(rlst, this.cfg.headlesschromename, () => {});

            for (let ii = 0; ii < rlst.length; ++ii) {
                startJYMX2Crawler_day(rlst[ii].symbol, today, this.cfg.headlesschromename);
                // startJYMX2Crawler_day(key, '2018-02-05');
            }

                    CrawlerMgr.singleton.start(true, false, () => {
                        this.onEnd();
                    }, true);
                // });
            // });
        });
    }
};

taskFactory.regTask(TASK_NAMEID_SINASTOCKJYMXTODAY, (taskfactory, cfg) => {
    return new TaskSinaStockJYMXToday(taskfactory, cfg);
});

exports.TaskSinaStockJYMXToday = TaskSinaStockJYMXToday;