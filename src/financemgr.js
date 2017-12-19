"use strict";

const util = require('util');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;

const SQL_BATCH_NUMS = 2048;

class FinanceMgr {
    constructor() {
        this.mapSSEStock = {};
        this.mapSZSEStock = {};

        this.mapJRJFund = {};

        this.mysqlid = undefined;
    }

    init(mysqlid) {
        this.mysqlid = mysqlid;
    }

    async loadSSEStockBase() {
        this.mapSSEStock = {};

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
        this.mapSZSEStock = {};

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

    async loadJRJFund() {
        this.mapJRJFund = {};

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from fundbase");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            this.addJRJFund(rows[i].code, rows[i].name, rows[i].type0, rows[i].type1, rows[i].type2, true);
        }
    }

    addJRJFund(code, name, type0, type1, type2, indb) {
        let fund = {
            code: code,
            name: name,
            type0: type0,
            type1: type1,
            type2: type2,
            indb: indb
        };

        this.mapJRJFund[code] = fund;
    }

    updJRJFund(code, name, type0, type1, type2) {
        this.mapJRJFund[code].name = name;
        this.mapJRJFund[code].type0 = type0;
        this.mapJRJFund[code].type1 = type1;
        this.mapJRJFund[code].type2 = type2;
    }

    async saveJRJFund() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;
        for (let code in this.mapJRJFund) {
            let curfund = this.mapJRJFund[code];
            if (!curfund.indb) {
                let str0 = '';
                let str1 = '';

                let i = 0;
                for (let key in curfund) {
                    if (key != 'indb') {
                        if (i != 0) {
                            str0 += ', ';
                            str1 += ', ';
                        }

                        str0 += '`' + key + '`';
                        str1 += "'" + curfund[key] + "'";

                        ++i;
                    }
                }

                let sql = util.format("insert into fundbase(%s) values(%s);", str0, str1);
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
};

FinanceMgr.singleton = new FinanceMgr();

exports.FinanceMgr = FinanceMgr;