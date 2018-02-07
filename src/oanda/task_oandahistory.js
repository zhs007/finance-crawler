"use strict";

const moment = require('moment');
const { Task, crawlercore, log } = require('jarvis-task');
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
        return new Promise((resolve, reject) => {

            let td = countTradingDay(ymd);
            if (td == undefined) {
                resolve(undefined);

                return ;
            }

            log('info', JSON.stringify(td));

            try {
                this.ctx.instrument.candles(instrument, {
                    price: 'BA',
                    from: td.begintime,//'2018-01-01T22:00:00Z',//td.begintime,
                    to: td.endtime,//'2018-01-01T23:00:00Z',//td.endtime,
                    granularity: timemode,
                    // count: 4999,
                    // smooth: true
                }, (res) => {
                    if (res && res.body && res.body.candles) {
                        let lst = [];
                        for (let ii = 0; ii < res.body.candles.length; ++ii) {
                            let cn = res.body.candles[ii];

                            lst.push({
                                realtime: cn.time,
                                ask_o: Math.floor(parseFloat(cn.ask.o) * 100000),
                                ask_c: Math.floor(parseFloat(cn.ask.c) * 100000),
                                ask_h: Math.floor(parseFloat(cn.ask.h) * 100000),
                                ask_l: Math.floor(parseFloat(cn.ask.l) * 100000),
                                bid_o: Math.floor(parseFloat(cn.bid.o) * 100000),
                                bid_c: Math.floor(parseFloat(cn.bid.c) * 100000),
                                bid_h: Math.floor(parseFloat(cn.bid.h) * 100000),
                                bid_l: Math.floor(parseFloat(cn.bid.l) * 100000),
                                volume: cn.volume
                            });
                        }

                        resolve(lst);

                        return ;
                    }

                    // console.log(JSON.stringify(res));

                    resolve(undefined);
                });
            }
            catch (err) {
                resolve(undefined);
            }
        });
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.init(this.cfg.maindb);

        setTimeout(async () => {

            let st = moment(this.cfg.starttime);
            let isend = false;
            while (true) {
                if (st.format('YYYY-MM-DD') == this.cfg.endtime) {
                    isend = true;
                }

                let curlst = await this.procDay(this.cfg.instrument, st.format('YYYY-MM-DD'), this.cfg.timemode);
                if (curlst) {
                    log('info', curlst.length);

                    await FinanceMgr.singleton.saveOandaInstrument(this.cfg.tablename, curlst);

                    if (isend) {
                        break;
                    }

                    st.add(1, 'day');
                }
            }

            this.onEnd();

        }, 1000);

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