"use strict";

let { CrawlerMgr, CRAWLER, DATAANALYSIS, STORAGE } = require('crawlercore');
let cheerio = require('cheerio');
let { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'szse_stocklistpost';

function fixstr(str) {
    return str.replace(/[ ]/g, '');
}

async function analysisLine(crawler, ele) {
    try {
        let lstchild = cheerio(ele).children();
        let code = lstchild.eq(0).text();
        let name = fixstr(lstchild.eq(1).text());
        let fname = lstchild.eq(2).text();
        let hy = lstchild.eq(3).text().substr(2);
        let wz = lstchild.eq(4).text();

        if (!FinanceMgr.singleton.mapSZSEStock.hasOwnProperty(code)) {
            FinanceMgr.singleton.addSZSEStock(code, name, fname, hy, wz, false);

            console.log(code + ' ' + name);
        }
    }
    catch(err) {
        console.log('err ' + crawler.options.uri + ' ' + err.toString());
    }

    return crawler;
}

// 分析数据
async function func_analysis(crawler) {
    crawler.da.data('#REPORTID_tab1 > tbody tr').each((index, element) => {
        if (index > 0) {
            analysisLine(crawler, element);
        }

        return true;
    });

    return crawler;
}

let stocklistpostOptions = {
    typename: OPTIONS_TYPENAME,

    method: 'POST',
    // 主地址
    uri: 'http://www.szse.cn/szseWeb/FrontController.szse?randnum=0.3925184221593909',
    timeout: 30 * 1000,

    form: {
        ACTIONID: 7,
        AJAX: 'AJAX-TRUE',
        CATALOGID: 1110,
        TABKEY: 'tab1',
        tab1PAGENO: 2,
        tab1PAGECOUNT: 206,
        tab1RECORDCOUNT: 2060,
        REPORT_ACTION: 'navigate'
    },

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.CHEERIO,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined
};

async function startStockListPostCrawler(catalogid, tabkey, pageno, pagecount, recordcount, func_onfinish) {
    let op = Object.assign({}, stocklistpostOptions);
    op.uri = 'http://www.szse.cn/szseWeb/FrontController.szse?randnum=' + Math.random();
    op.form = {
        ACTIONID: 7,
        AJAX: 'AJAX-TRUE',
        CATALOGID: catalogid,
        TABKEY: tabkey,
        tab1PAGENO: pageno,
        tab1PAGECOUNT: pagecount,
        tab1RECORDCOUNT: recordcount,
        REPORT_ACTION: 'navigate'
    };
    op.func_onfinish = func_onfinish;

    await CrawlerMgr.singleton.addCrawler(op);
}

exports.stocklistpostOptions = stocklistpostOptions;
exports.startStockListPostCrawler = startStockListPostCrawler;

CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
    let options = Object.assign({}, stocklistpostOptions);
    return options;
});