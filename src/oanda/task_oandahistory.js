"use strict";

const moment = require('moment');
const process = require('process');
const { Task, log } = require('jarvis-task');
// const { CrawlerMgr } = crawlercore;
const { alignCandles, roundingOffTime } = require('libtrader');
const { taskFactory } = require('../taskfactory');
const { TASK_NAMEID_OANDAHISTORY } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { createContext, countTradingDay } = require('./oanda');
// const { startJYMX2Crawler_day } = require('./stockjymx');
// const { stocklistjsOptions } = require('./stocklistjs');

const TIMEOUT = 90;

class TaskOandaHistory extends Task {
    constructor(taskfactory, cfg) {
        super(taskfactory, TASK_NAMEID_OANDAHISTORY, cfg);

        this.ctx = createContext(cfg.oanda.hostname, cfg.oanda.port, cfg.oanda.ssl, 'oanda samples', cfg.oanda.token);
        this.lasttime = TIMEOUT;
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
                    from: moment(td.begintime).subtract(1, 'h').utc().format(),//'2018-01-01T22:00:00Z',//td.begintime,
                    to: moment(td.endtime).add(1, 'h').utc().format(),//'2018-01-01T23:00:00Z',//td.endtime,
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

                        if (lst.length > 0) {
                            let bt = roundingOffTime(new Date(lst[0].realtime), 'h', 20);
                            let et = roundingOffTime(new Date(lst[lst.length - 1].realtime), 'h', 40);

                            let bbt = new Date(td.begintime);
                            let bet = new Date(td.endtime);

                            if (bt.getTime() < bbt.getTime()) {
                                bt = bbt;
                            }

                            if (et.getTime() > bet.getTime()) {
                                et = bet;
                            }

                            let nlst = alignCandles(lst, {
                                realtime: 'realtime',
                                ask_o: 'ask_o',
                                ask_c: 'ask_c',
                                ask_h: 'ask_h',
                                ask_l: 'ask_l',
                                bid_o: 'bid_o',
                                bid_c: 'bid_c',
                                bid_h: 'bid_h',
                                bid_l: 'bid_l',
                                volume: 'volume',
                            }, (timems) => {
                                return timems + 60 * 1000;
                            }, bt.toISOString(), et.toISOString());

                            resolve(nlst);
                        }
                        else {
                            resolve([]);
                        }

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

        setInterval(()=> {
            this.lasttime--;

            if (this.lasttime <= 0) {
                process.exit(0);
            }

        }, 1000);

        setTimeout(async () => {

            let lastday = await FinanceMgr.singleton.getLastDayOandaInstrument(this.cfg.tablename);
            let starttime = this.cfg.starttime;
            if (lastday != undefined) {
                starttime = moment(lastday).subtract(1, 'days').format();
            }

            let st = moment(starttime);
            let isend = false;
            while (true) {
                if (st.format('YYYY-MM-DD') == this.cfg.endtime) {
                    isend = true;
                }

                this.lasttime = TIMEOUT;
                let curlst = await this.procDay(this.cfg.instrument, st.format('YYYY-MM-DD'), this.cfg.timemode);
                if (curlst) {
                    log('info', curlst.length);

                    if (curlst.length > 0) {
                        await FinanceMgr.singleton.saveOandaInstrument(this.cfg.tablename, curlst);
                    }

                    if (isend) {
                        break;
                    }

                    st.add(1, 'day');
                }
            }

            this.onEnd();

        }, 1000);

    }
};

taskFactory.regTask(TASK_NAMEID_OANDAHISTORY, (taskfactory, cfg) => {
    return new TaskOandaHistory(taskfactory, cfg);
});

exports.TaskOandaHistory = TaskOandaHistory;