"use strict";

const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const { FinanceMgr } = require('../financemgr');
const { startAllStockListCrawler } = require('./stocklist');

const OPTIONS_TYPENAME = 'sina_stocklistnums';

// 分析数据
async function func_analysis(crawler) {
    if (crawler.data != undefined) {
        let arr = crawler.data.split('"');
        if (arr.length == 3) {
            let nums = arr[1];

            startAllStockListCrawler(nums, () => {});
        }
    }

    return crawler;
}

let stocklistnumsOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeStockCount?node=hs_a',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.NULL,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined
};

function startStockListNumsCrawler(callback) {
    let op = Object.assign({}, stocklistnumsOptions);

    // op.uri = uri;
    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

exports.stocklistnumsOptions = stocklistnumsOptions;
exports.startStockListNumsCrawler = startStockListNumsCrawler;