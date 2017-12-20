"use strict";

const moment = require('moment');
const util = require('util');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr, CRAWLER, DATAANALYSIS } = crawlercore;
const cheerio = require('cheerio');
const { FinanceMgr } = require('../financemgr');

const OPTIONS_TYPENAME = 'jrj_fundarch';

// 分析数据
async function func_analysis(crawler) {
    let lst = [];

    let jsonstr = crawler.data.substr(8);
    let obj = JSON.parse(jsonstr);

    if (obj.hasOwnProperty('fundHistoryNetValue') && Array.isArray(obj.fundHistoryNetValue)) {
        for (let ii = 0 ; ii < obj.fundHistoryNetValue.length; ++ii) {
            let curfdnv = obj.fundHistoryNetValue[ii];

            if (moment(curfdnv.enddate).isBetween(crawler.options.startday, crawler.options.endday, null, '[]')) {
                let curobj = {
                    fundcode: crawler.options.fundcode,
                    enddate: curfdnv.enddate,
                    accum_net: Math.floor(parseFloat(curfdnv.accum_net) * 10000),
                    unit_net: Math.floor(parseFloat(curfdnv.unit_net) * 10000),
                    unit_net_chng_1: Math.floor(parseFloat(curfdnv.unit_net_chng_1) * 10000),
                    unit_net_chng_pct: Math.floor(parseFloat(curfdnv.unit_net_chng_pct) * 10000),
                    unit_net_chng_pct_1_mon: Math.floor(parseFloat(curfdnv.unit_net_chng_pct_1_mon) * 10000),
                    unit_net_chng_pct_1_week: Math.floor(parseFloat(curfdnv.unit_net_chng_pct_1_week) * 10000),
                    unit_net_chng_pct_1_year: Math.floor(parseFloat(curfdnv.unit_net_chng_pct_1_year) * 10000),
                    unit_net_chng_pct_3_mon: Math.floor(parseFloat(curfdnv.unit_net_chng_pct_3_mon) * 10000),
                    guess_net: 0
                };

                if (isNaN(curobj.unit_net)) {
                    curobj.unit_net = 0;
                }

                if (isNaN(curobj.accum_net)) {
                    curobj.accum_net = 0;
                }

                if (isNaN(curobj.unit_net_chng_1)) {
                    curobj.unit_net_chng_1 = 0;
                }

                if (isNaN(curobj.unit_net_chng_pct)) {
                    curobj.unit_net_chng_pct = 0;
                }

                if (isNaN(curobj.unit_net_chng_pct_1_mon)) {
                    curobj.unit_net_chng_pct_1_mon = 0;
                }

                if (isNaN(curobj.unit_net_chng_pct_1_week)) {
                    curobj.unit_net_chng_pct_1_week = 0;
                }

                if (isNaN(curobj.unit_net_chng_pct_1_year)) {
                    curobj.unit_net_chng_pct_1_year = 0;
                }

                if (isNaN(curobj.unit_net_chng_pct_3_mon)) {
                    curobj.unit_net_chng_pct_3_mon = 0;
                }

                lst.push(curobj);
            }
        }

        if (lst.length > 0) {
            await FinanceMgr.singleton.saveJRJFundNet(crawler.options.fundcode, lst);
        }
    }

    return crawler;
}

let fundarchOptions = {
    typename: OPTIONS_TYPENAME,
    // 主地址
    uri: 'http://fund.jrj.com.cn/family.shtml',
    timeout: 30 * 1000,
    force_encoding: 'gbk',

    // 爬虫类型
    crawler_type: CRAWLER.REQUEST,

    // 数据分析配置
    dataanalysis_type: DATAANALYSIS.NULL,

    // 分析数据
    func_analysis: func_analysis,
    func_onfinish: undefined,

    fundcode: '000975',
    year: 2016,

    startday: '',
    endday: '',
};

function startFundArchCrawler(fundcode, year, startday, endday, callback) {
    let op = Object.assign({}, fundarchOptions);

    op.fundcode = fundcode;
    op.year = year;
    op.startday = startday;
    op.endday = endday;
    op.uri = util.format('http://fund.jrj.com.cn/json/archives/history/netvalue?fundCode=%s&obj=obj&date=%d', fundcode, year);
    op.func_onfinish = callback;

    CrawlerMgr.singleton.addCrawler(op);
}

function startNewFundArchCrawler(lst, callback) {
    let curyear = parseInt(moment().format('YYYY'));
    for (let ii = 0; ii < lst.length; ++ii) {
        for (let jj = 1999; jj <= curyear; ++jj) {
            startFundArchCrawler(lst[ii].code, jj, jj + '-01-01', jj + '-12-31', callback);
        }
    }
}

exports.fundarchOptions = fundarchOptions;
exports.startFundArchCrawler = startFundArchCrawler;
exports.startNewFundArchCrawler = startNewFundArchCrawler;

// CrawlerMgr.singleton.regOptions(OPTIONS_TYPENAME, () => {
//     let options = Object.assign({}, stocklistOptions);
//     return options;
// });