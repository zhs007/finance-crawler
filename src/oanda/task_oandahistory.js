"use strict";

const moment = require('moment');
const { Task, crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_OANDAHISTORY } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { createContext, countTradingDay } = require('./oanda');
// const { startJYMX2Crawler_day } = require('./stockjymx');
// const { stocklistjsOptions } = require('./stocklistjs');

class TaskOandaHistory extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_OANDAHISTORY, cfg);

        this.ctx = createContext(cfg.oanda.hostname, cfg.oanda.port, cfg.oanda.ssl, 'oanda samples', cfg.oanda.token);
    }

    async procDay(instrument, ymd, timemode) {
        let td = countTradingDay(ymd);
        if (td == undefined) {
            return ;
        }

        ctx.instrument.candles(instrument, {
            price: 'BA',
            from: td.begintime,
            to: td.endtime,
            granularity: timemode
        }, (res) => {
            // console.log(JSON.stringify(response1));


        });
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);


        // FinanceMgr.singleton.loadSinaStock().then(async () => {
        //
        //     let curlst = await FinanceMgr.singleton.countSinaJYMXList(today);
        //     let rlst = FinanceMgr.singleton.reselectSinaStock(curlst);
        //
        //     for (let ii = 0; ii < rlst.length; ++ii) {
        //         startJYMX2Crawler_day(rlst[ii].symbol, today, this.cfg.headlesschromename);
        //     }
        //
        //     CrawlerMgr.singleton.start(true, false, () => {
        //         this.onEnd();
        //     }, true);
        // });
    }
};

taskFactory.regTask(TASK_NAMEID_OANDAHISTORY, (taskfactory, cfg) => {
    return new TaskOandaHistory(taskfactory, cfg);
});

exports.TaskOandaHistory = TaskOandaHistory;