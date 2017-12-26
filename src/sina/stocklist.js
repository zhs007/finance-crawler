"use strict";

const util = require('util');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'sina_stocklist';

// 分析数据
async function func_analysis(crawler) {
    crawler.da.runScript('var lst = ' + crawler.data.toString() + ';');
    let curlst = crawler.da.context.lst;

    for (let ii = 0; ii < curlst.length; ++ii) {
        if (!FinanceMgr.singleton.mapSINAStock.hasOwnProperty(curlst[ii].symbol)) {
            FinanceMgr.singleton.addSinaStock(curlst[ii].symbol, curlst[ii].code, curlst[ii].name, false);
        }
    }

    return crawler;
}

let stocklistOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=1&num=40&sort=symbol&asc=1&node=hs_a&symbol=&_s_r_a=init',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.JAVASCRIPT,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined
};

function startStockListCrawler(pageindex, callback) {
    let op = Object.assign({}, stocklistOptions);

    op.uri = util.format('http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=%d&num=40&sort=symbol&asc=1&node=hs_a&symbol=&_s_r_a=init', pageindex);
    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

function startAllStockListCrawler(totalnums, callback) {
    let maxpi = Math.ceil(totalnums / 40);
    for (let pi = 1; pi <= maxpi; ++pi) {
        startStockListCrawler(pi);
    }
}

exports.stocklistOptions = stocklistOptions;
exports.startStockListCrawler = startStockListCrawler;
exports.startAllStockListCrawler = startAllStockListCrawler;