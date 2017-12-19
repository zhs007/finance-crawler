"use strict";

const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const cheerio = require('cheerio');
const { FinanceMgr } = require('../financemgr');
const { startFundBaseCrawler } = require('./fundbase');

const OPTIONS_TYPENAME = 'jrj_totalfund';

// 分析数据
async function func_analysis(crawler) {
    crawler.da.data('[href]').each((index, element) => {
        if (element.name == 'a' && element.attribs.href.indexOf('http://fund.jrj.com.cn/archives,') == 0) {
            let str0 = element.attribs.href.split(',');
            let fundcode = str0[1].split('.')[0];

            if (!FinanceMgr.singleton.mapJRJFund.hasOwnProperty(fundcode)) {
                FinanceMgr.singleton.addJRJFund(fundcode, element.attribs.title, '', '', '', false);

                startFundBaseCrawler(element.attribs.href, () => {});
            }
        }

        return true;
    });

    return crawler;
}

let totalfundOptions = {
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
    func_onfinish: undefined
};

function startTotalFundCrawler(callback) {
    let op = Object.assign({}, totalfundOptions);

    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

exports.totalfundOptions = totalfundOptions;
exports.startTotalFundCrawler = startTotalFundCrawler;

// CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
//     let options = Object.assign({}, stocklistOptions);
//     return options;
// });