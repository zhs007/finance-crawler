"use strict";

const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const cheerio = require('cheerio');
const { startStockListJSCrawler } = require('./stocklistjs');

const OPTIONS_TYPENAME = 'sse_stocklist';

// 分析数据
async function func_analysis(crawler) {
    crawler.da.data('script').each((index, element) => {
        let obj = cheerio(element);
        let src = obj.attr('src');
        if (src != undefined && src.indexOf('ssesuggestdata.js') > 0) {
            if (src.indexOf('http://') == 0) {
                startStockListJSCrawler(src, crawler.options.func_onfinish);
            }
            else {
                startStockListJSCrawler('http://www.sse.com.cn' + src, crawler.options.func_onfinish);
            }
        }

        return true;
    });

    return crawler;
}

let stocklistOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://www.sse.com.cn/assortment/stock/list/share/',
    timeout: 30 * 1000,

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.CHEERIO,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined
};

function startStockListCrawler(callback) {
    let op = Object.assign({}, stocklistOptions);

    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

exports.stocklistOptions = stocklistOptions;
exports.startStockListCrawler = startStockListCrawler;

// CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
//     let options = Object.assign({}, stocklistOptions);
//     return options;
// });