"use strict";

const util = require('util');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;

const SQL_BATCH_NUMS = 2048;

class FinanceMgr {
    constructor() {
        this.mapSSEStock = {};
        this.mapSZSEStock = {};

        this.mysqlid = undefined;
    }

    init(mysqlid) {
        this.mysqlid = mysqlid;
    }

    async loadSSEStockBase() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from ssestock");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            this.addSSEStock(rows[i].code, rows[i].cname, rows[i].ename, true);
        }
    }

    async saveSSEStockBase() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;
        for (let code in this.mapSSEStock) {
            let curstock = this.mapSSEStock[code];
            if (!curstock.indb) {
                let str0 = '';
                let str1 = '';

                let i = 0;
                for (let key in curstock) {
                    if (key != 'indb') {
                        if (i != 0) {
                            str0 += ', ';
                            str1 += ', ';
                        }

                        str0 += '`' + key + '`';
                        str1 += "'" + curstock[key] + "'";

                        ++i;
                    }
                }

                let sql = util.format("insert into ssestock(%s) values(%s);", str0, str1);
                fullsql += sql;
                ++sqlnums;

                if (sqlnums >= SQL_BATCH_NUMS) {
                    try{
                        await conn.query(fullsql);
                    }
                    catch(err) {
                        console.log('mysql err: ' + err);
                        console.log('mysql sql: ' + fullsql);
                    }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            try{
                await conn.query(fullsql);
            }
            catch(err) {
                console.log('mysql err: ' + err);
                console.log('mysql sql: ' + fullsql);
            }
        }
    }

    addSSEStock(code, cname, ename, indb) {
        let s = {
            code: code,
            cname: cname,
            ename: ename,
            indb: indb
        };

        this.mapSSEStock[code] = s;
    }

    async loadSZSEStockBase() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from szsestock");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            this.addSZSEStock(rows[i].code, rows[i].name, rows[i].fullname, rows[i].category, rows[i].url, true);
        }
    }

    async saveSZSEStockBase() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;
        for (let code in this.mapSZSEStock) {
            let curstock = this.mapSZSEStock[code];
            if (!curstock.indb) {
                let str0 = '';
                let str1 = '';

                let i = 0;
                for (let key in curstock) {
                    if (key != 'indb') {
                        if (i != 0) {
                            str0 += ', ';
                            str1 += ', ';
                        }

                        str0 += '`' + key + '`';
                        str1 += "'" + curstock[key] + "'";

                        ++i;
                    }
                }

                let sql = util.format("insert into szsestock(%s) values(%s);", str0, str1);
                fullsql += sql;
                ++sqlnums;

                if (sqlnums >= SQL_BATCH_NUMS) {
                    try{
                        await conn.query(fullsql);
                    }
                    catch(err) {
                        console.log('mysql err: ' + err);
                        console.log('mysql sql: ' + fullsql);
                    }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            try{
                await conn.query(fullsql);
            }
            catch(err) {
                console.log('mysql err: ' + err);
                console.log('mysql sql: ' + fullsql);
            }
        }
    }

    addSZSEStock(code, name, fullname, category, url, indb) {
        let s = {
            code: code,
            name: name,
            fullname: fullname,
            category: category,
            url: url,
            indb: indb
        };

        this.mapSZSEStock[code] = s;
    }
};

FinanceMgr.singleton = new FinanceMgr();

exports.FinanceMgr = FinanceMgr;