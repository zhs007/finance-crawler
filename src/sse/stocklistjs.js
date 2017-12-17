"use strict";

const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'sse_stocklistjs';

// 分析数据
async function func_analysis(crawler) {
    crawler.da.runCurCode();
    crawler.da.runScript('var lst = get_data();');
    let lst = crawler.da.context.lst;

    for (let i = 0; i < lst.length; ++i) {
        if (!FinanceMgr.singleton.mapSSEStock.hasOwnProperty(lst[i].val)) {
            FinanceMgr.singleton.addSSEStock(lst[i].val, lst[i].val2, lst[i].val3);

            console.log(lst[i]);
        }
    }

    return crawler;
}

let stocklistjsOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://www.sse.com.cn/js/common/ssesuggestdata.js;pv8b21d2075867a9bf',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.JAVASCRIPT,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined
};

function startStockListJSCrawler(uri, callback) {
    let op = Object.assign({}, stocklistjsOptions);

    op.uri = uri;
    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

exports.stocklistjsOptions = stocklistjsOptions;
exports.startStockListJSCrawler = startStockListJSCrawler;