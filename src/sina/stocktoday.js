"use strict";

const util = require('util');
const moment = require('moment');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS, getVal_CDPCallFrame, HeadlessChromeMgr } = crawlercore;
const { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'sina_stocktoday';

// 分析数据
async function func_analysis(crawler) {
    const { Page, Runtime, Debugger, Network } = crawler.client;

    Debugger.paused(async (params) => {

        let obj = await getVal_CDPCallFrame('h', params.callFrames, Runtime);
        // console.log('headlesschrome2 ' + JSON.stringify(obj));

        let today = moment().format('YYYY-MM-DD');
        let curday = obj.data.td1[0].today;
        if (today == curday) {
            let lst = [];
            for (let i = 0; i <= 240; ++i) {
                let co = {
                    code: crawler.options.code,
                    price: obj.data.td1[i].price * 10000,
                    avg_price: obj.data.td1[i].avg_price * 10000,
                    volume: obj.data.td1[i].volume * 10000,
                    timem: curday + ' ' + obj.data.td1[i].time
                };

                if (isNaN(co.avg_price)) {
                    co.avg_price = 0;
                }

                lst.push(co);
            }

            FinanceMgr.singleton.saveSainStockPriceM(crawler.options.code, lst, curday);
        }

        Debugger.resume();

        crawler.options.isok = true;

        // crawler.client.close();
        // crawler.launcher.kill();
    });

    Debugger.scriptParsed((params) => {
        if ('http://finance.sina.com.cn/sinafinancesdk/js/chart/h5t.js' == params.url) {
            Debugger.getScriptSource({'scriptId': params.scriptId}, (err, msg) => {
                if (err) {
                    return;
                }

                let ci = msg.scriptSource.indexOf('window["KLC_ML_"+a]=null;');
                let loc = {
                    scriptId: params.scriptId,
                    lineNumber: 0,
                    columnNumber: ci
                };

                Debugger.setBreakpoint({location: loc}, (err, params1) => {
                    console.log("params1 : " + JSON.stringify(params1));
                });
            });
        }
    });

    await Promise.all([
        Page.enable(),
        Debugger.enable(),
        Network.enable()
    ]);

    await Page.navigate({url: crawler.options.uri});
    await Page.loadEventFired();

    setTimeout(() => {
        HeadlessChromeMgr.singleton.closeTab(crawler.client);

        if (!crawler.options.isok) {
            startStockTodayCrawler(crawler.options.symbol,
                crawler.options.code,
                crawler.options.headlesschromename,
                crawler.options.func_onfinish);
        }
    }, 1000);

    return crawler;
}

let stocktodayOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://quotes.sina.cn/hs/company/quotes/view/sh600000/?from=wap',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.HEADLESSCHROME,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.NULL,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    headlesschromename: '',
    code: 600000,
    symbol: 'sh600000',

    isok: false
};

function startStockTodayCrawler(symbol, code, hcname, callback) {
    let op = Object.assign({}, stocktodayOptions);
    op.uri = util.format('http://quotes.sina.cn/hs/company/quotes/view/%s/?from=wap', symbol);
    op.headlesschromename = hcname;
    op.code = code;
    CrawlerMgr.singleton.addCrawler(op);
}

function startStockToday2Crawler_List(lst, hcname, callback) {
    for (let i = 0; i < lst.length; ++i) {
        startStockTodayCrawler(lst[i].symbol, lst[i].code, hcname, callback);
    }
}

exports.stocktodayOptions = stocktodayOptions;
exports.startStockTodayCrawler = startStockTodayCrawler;
exports.startStockToday2Crawler_List = startStockToday2Crawler_List;