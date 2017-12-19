"use strict";

const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const cheerio = require('cheerio');
const { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'jrj_fundbase';

// 分析数据
async function func_analysis(crawler) {
    let mh_title = crawler.da.data('h1.mh-title').text();
    let titlearr0 = mh_title.split('（');
    let titlearr1 = titlearr0[1].split('）');
    let title = titlearr0[0];
    let code = titlearr1[0];

    let fsarr = [];
    crawler.da.data('i.zt').each((index, element) => {
        if (element.children.length > 0 && element.children[0].children.length > 0) {
            fsarr.push(element.children[0].children[0].data);
        }
        else {
            fsarr.push('');
        }
    });

    if (fsarr.length == 2) {
        fsarr.splice(0, 0, '');
    }

    FinanceMgr.singleton.updJRJFund(code, fsarr[0], fsarr[1], fsarr[2]);

    return crawler;
}

let fundbaseOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://fund.jrj.com.cn/family.shtml',
    timeout: 30 * 1000,
    force_encoding: 'gbk',

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.CHEERIO,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    fundcode: 0
};

function startFundBaseCrawler(fundcode, uri, callback) {
    let op = Object.assign({}, fundbaseOptions);

    op.uri = uri;
    op.func_onfinish = callback;
    op.fundcode = fundcode;

    CrawlerMgr.singleton.addCrawler(op);
}

exports.fundbaseOptions = fundbaseOptions;
exports.startFundBaseCrawler = startFundBaseCrawler;

// CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
//     let options = Object.assign({}, stocklistOptions);
//     return options;
// });