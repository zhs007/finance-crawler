"use strict";

const util = require('util');
const moment = require('moment');
const { crawlercore } = require('jarvis-task');
const { CrawlerMgr } = crawlercore;
const { runQuery } = require('./mysql');

const SQL_BATCH_NUMS = 2048;

class FinanceMgr {
    constructor() {
        this.mapDayOff = {};

        this.mapSSEStock = {};
        this.mapSZSEStock = {};

        this.mapJRJFund = {};
        this.mapSINAStock = {};

        this.mysqlid = undefined;
    }

    init(mysqlid) {
        this.mysqlid = mysqlid;
    }

    async loadDayOff() {
        this.mapDayOff = {};

        let conn = MysqlMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from dayoff");
        let [rows, fields] = await conn.query(str);
        for (let i = 0; i < rows.length; ++i) {
            let cd = moment(rows[i].dayoff).format('YYYY-MM-DD');

            this.mapDayOff[cd] = true;  // 表示数据库里有
        }
    }

    isDayOff(curday) {
        let cd = moment(curday).format('d');
        // 周末
        if (cd == 0 || cd == 6) {
            return true;
        }

        return this.mapDayOff.hasOwnProperty(curday);
    }

    async loadSSEStockBase() {
        this.mapSSEStock = {};

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from ssestock");
        let rows = await runQuery(conn, str);
        if (rows != undefined) {
            for (let i = 0; i < rows.length; ++i) {
                this.addSSEStock(rows[i].code, rows[i].cname, rows[i].ename, true);
            }
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
                    await runQuery(conn, fullsql);
                    // try{
                    //     await conn.query(fullsql);
                    // }
                    // catch(err) {
                    //     console.log('mysql err: ' + err);
                    //     console.log('mysql sql: ' + fullsql);
                    // }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try{
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
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
        // let [rows, fields] = await conn.query(str);
        let rows = await runQuery(conn, str);
        if (rows != undefined) {
            for (let i = 0; i < rows.length; ++i) {
                this.addSZSEStock(rows[i].code, rows[i].name, rows[i].fullname, rows[i].category, rows[i].url, true);
            }
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
                    await runQuery(conn, fullsql);
                    // try{
                    //     await conn.query(fullsql);
                    // }
                    // catch(err) {
                    //     console.log('mysql err: ' + err);
                    //     console.log('mysql sql: ' + fullsql);
                    // }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try{
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
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

        let str = util.format("select * from jrjfundbase");
        // let [rows, fields] = await conn.query(str);
        let rows = await runQuery(conn, str);
        if (rows != undefined) {
            for (let i = 0; i < rows.length; ++i) {
                this.addJRJFund(rows[i].code, rows[i].name, rows[i].type0, rows[i].type1, rows[i].type2, true);
            }
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

    getNewJRJFund() {
        let lst = [];
        for (let code in this.mapJRJFund) {
            let curfund = this.mapJRJFund[code];
            if (!curfund.indb) {
                lst.push(curfund);
            }
        }

        return lst;
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

                let sql = util.format("insert into jrjfundbase(%s) values(%s);", str0, str1);
                fullsql += sql;
                ++sqlnums;

                if (sqlnums >= SQL_BATCH_NUMS) {
                    await runQuery(conn, fullsql);
                    // try{
                    //     await conn.query(fullsql);
                    // }
                    // catch(err) {
                    //     console.log('mysql err: ' + err);
                    //     console.log('mysql sql: ' + fullsql);
                    // }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try{
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
        }
    }

    async _fixSinaStockCodeDay(tname, code, today) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("select * from `%s` where date(timem) = '%s' and code = '%s';", tname, today, code);
        try{
            let rows = await runQuery(conn, sql);
            if (rows != undefined && rows.length != 241 && rows.length > 0) {
                sql = util.format("delete from `%s` where date(timem) = '%s' and code = '%s';", tname, today, code);
                await runQuery(conn, sql);
            }
            // let [rows, fields] = await conn.query(sql);
            // if (rows.length != 241 && rows.length > 0) {
            //     sql = util.format("delete from `%s` where date(timem) = '%s' and code = '%s';", tname, today, code);
            //     await conn.query(sql);
            // }
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    async _fixSinaStockDay(tname, today) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let sql = util.format("select DISTINCT(code) from %s where date(timem) = '%s';", tname, today);
        try{
            let rows = await runQuery(conn, sql);
            if (rows != undefined) {
                for (let ii = 0; ii < rows.length; ++ii) {
                    await this._fixSinaStockCodeDay(tname, rows[ii].code, today);
                }
            }
            // let [rows, fields] = await conn.query(sql);
        }
        catch(err) {
            console.log('mysql err: ' + err);
            console.log('mysql sql: ' + sql);
        }
    }

    async fixSinaStockToday(today) {
        for (let ii = 0; ii < 10; ++ii) {
            await this._fixSinaStockDay('sinastock_m_' + ii, today);
        }
    }

    async _delJRJFundNet(tname, lst) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';

        for (let ii = 0; ii < lst.length; ++ii) {
            let sql = util.format("delete from `%s` where date(enddate) = date('%s') and fundcode = '%s';", tname, lst[ii].enddate, lst[ii].fundcode);
            fullsql += sql;
        }

        await runQuery(conn, fullsql);
        // try{
        //     await conn.query(fullsql);
        // }
        // catch(err) {
        //     console.log('mysql err: ' + err);
        //     console.log('mysql sql: ' + fullsql);
        // }
    }

    async saveJRJFundNet(fundcode, lst) {
        let tname = 'jrjfundnet_' + fundcode.charAt(5);

        await this._delJRJFundNet(tname, lst);

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;
        for (let ii = 0; ii < lst.length; ++ii) {
            let curfund = lst[ii];
            if (!curfund.indb) {
                let str0 = '';
                let str1 = '';

                let i = 0;
                for (let key in curfund) {
                    if (i != 0) {
                        str0 += ', ';
                        str1 += ', ';
                    }

                    str0 += '`' + key + '`';
                    str1 += "'" + curfund[key] + "'";

                    ++i;
                }

                let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);
                fullsql += sql;
                ++sqlnums;

                if (sqlnums >= SQL_BATCH_NUMS) {
                    await runQuery(conn, fullsql);
                    // try{
                    //     await conn.query(fullsql);
                    // }
                    // catch(err) {
                    //     console.log('mysql err: ' + err);
                    //     console.log('mysql sql: ' + fullsql);
                    // }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try{
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
        }
    }

    async loadSinaStock() {
        this.mapSINAStock = {};

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let str = util.format("select * from sinastocklist");
        let rows = await runQuery(conn, str);
        if (rows != undefined) {
            for (let i = 0; i < rows.length; ++i) {
                this.addSinaStock(rows[i].symbol, rows[i].code, rows[i].name, true);
            }
        }
        // let [rows, fields] = await conn.query(str);
        // for (let i = 0; i < rows.length; ++i) {
        //     this.addSinaStock(rows[i].symbol, rows[i].code, rows[i].name, true);
        // }
    }

    addSinaStock(symbol, code, name, indb) {
        let stock = {
            code: code,
            name: name,
            symbol: symbol,
            indb: indb
        };

        this.mapSINAStock[symbol] = stock;
    }

    async saveSinaStock() {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;
        for (let symbol in this.mapSINAStock) {
            let curstock = this.mapSINAStock[symbol];
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

                let sql = util.format("insert into sinastocklist(%s) values(%s);", str0, str1);
                fullsql += sql;
                ++sqlnums;

                if (sqlnums >= SQL_BATCH_NUMS) {
                    await runQuery(conn, fullsql);
                    // try{
                    //     await conn.query(fullsql);
                    // }
                    // catch(err) {
                    //     console.log('mysql err: ' + err);
                    //     console.log('mysql sql: ' + fullsql);
                    // }

                    fullsql = '';
                    sqlnums = 0;
                }
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try{
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
        }
    }

    async saveSainStockPriceM(code, lst, curday) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;

        for (let i = 0; i < lst.length; ++i) {
            let cursp = lst[i];
            let str0 = '';
            let str1 = '';

            let j = 0;
            for (let key in cursp) {
                if (cursp[key] != undefined) {
                    if (j != 0) {
                        str0 += ', ';
                        str1 += ', ';
                    }

                    str0 += '`' + key + '`';
                    str1 += "'" + cursp[key] + "'";

                    ++j;
                }
            }

            let tname = 'sinastock_m_' + code.charAt(5);
            let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);

            fullsql += sql;
            ++sqlnums;

            if (sqlnums > SQL_BATCH_NUMS) {
                await runQuery(conn, fullsql);
                // try {
                //     await conn.query(fullsql);
                // }
                // catch(err) {
                //     console.log('mysql err: ' + err);
                //     console.log('mysql sql: ' + fullsql);
                // }

                fullsql = '';
                sqlnums = 0;
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
            // try {
            //     await conn.query(fullsql);
            // }
            // catch(err) {
            //     console.log('mysql err: ' + err);
            //     console.log('mysql sql: ' + fullsql);
            // }
        }

        return true;
    }

    async getSinaTodayStock(curday) {
        let lst = [];
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        for (let i = 0; i < 10; ++i) {
            let sql = util.format('select distinct(code) as code from sinastock_m_%d where date(timem) = \'%s\';', i, curday);
            let rows = await runQuery(conn, sql);
            if (rows != undefined) {
                for (let i = 0; i < rows.length; ++i) {
                    lst.push(rows[i].code);
                }
            }

            // let [rows, fields] = await conn.query(sql);
            // for (let i = 0; i < rows.length; ++i) {
            //     lst.push(rows[i].code);
            // }
        }

        return lst;
    }

    reselectSinaStock(lst) {
        let rlst = [];
        for (let symbol in this.mapSINAStock) {
            if (lst.indexOf(this.mapSINAStock[symbol].code) < 0) {
                rlst.push(this.mapSINAStock[symbol]);
            }
        }

        return rlst;
    }

    // ym is like 201801
    // ti is like 0-9
    async createSinaJYMXTable(ym, ti) {
        let sql = util.format("CREATE TABLE `sinajymx_%d_%d` (\n" +
            "  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
            "  `code` char(6) NOT NULL DEFAULT '',\n" +
            "  `price` int(11) DEFAULT NULL,\n" +
            "  `priceoff` int(11) DEFAULT NULL,\n" +
            "  `volume` int(11) DEFAULT NULL,\n" +
            "  `realmoney` bigint(20) DEFAULT NULL,\n" +
            "  `panstate` int(11) DEFAULT NULL,\n" +
            "  `realtime` timestamp NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  KEY `codetime` (`code`,`realtime`)\n" +
            ") ENGINE=MyISAM DEFAULT CHARSET=utf8;", ym, ti);

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);
        await runQuery(conn, sql);
    }

    async countSinaJYMXList(ymd) {
        let lst = [];

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        for (let ii = 0; ii < 10; ++ii) {
            let tname = 'sinajymxday_' + ii;
            let sql = util.format("select code, nums from `%s` where date(timed) = date('%s');", tname, ymd);
            let rows = await runQuery(conn, sql);
            if (rows != undefined) {
                let tname1 = 'sinajymx_' + moment(ymd).format('YYYYMM') + '_' + ii;

                for (let jj = 0; jj < rows.length; ++jj) {
                    let sql1 = util.format("select count(id) as nums from `%s` where date(realtime) = date('%s') and code = '%s';", tname1, ymd, rows[jj].code);
                    let rows1 = await runQuery(conn, sql1);
                    if (rows1 != undefined) {
                        if (rows1[0].nums == rows[jj].nums) {
                            lst.push(rows[jj].code);
                        }
                    }

                    // lst.push(rows[jj].code);
                }
            }
        }

        return lst;
    }

    async _delSinaJYMXDay(jymxday) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let tname = 'sinajymxday_' + jymxday.code.charAt(5);
        let sql = util.format("delete from `%s` where date(timed) = date('%s') and code = '%s';", tname, jymxday.timed, jymxday.code);
        await runQuery(conn, sql);
    }

    async saveSinaJYMXDay(jymxday) {
        await this._delSinaJYMXDay(jymxday);
        await this._delSinaJYMX(jymxday);

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;

        let str0 = '';
        let str1 = '';

        let j = 0;
        for (let key in jymxday) {
            if (jymxday[key] != undefined) {
                if (j != 0) {
                    str0 += ', ';
                    str1 += ', ';
                }

                str0 += '`' + key + '`';
                str1 += "'" + jymxday[key] + "'";

                ++j;
            }
        }

        let tname = 'sinajymxday_' + jymxday.code.charAt(5);
        let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);
        await runQuery(conn, sql);

        return true;
    }

    async _delSinaJYMX(jymxday) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let tname = 'sinajymx_' + moment(jymxday.timed).format('YYYYMM') + '_' + jymxday.code.charAt(5);
        let sql = util.format("delete from `%s` where date(realtime) = date('%s') and code = '%s';", tname, jymxday.timed, jymxday.code);
        await runQuery(conn, sql);
    }

    async saveSinaJYMX(ym, code, lst) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;

        for (let i = 0; i < lst.length; ++i) {
            let cursp = lst[i];
            let str0 = '';
            let str1 = '';

            let j = 0;
            for (let key in cursp) {
                if (cursp[key] != undefined) {
                    if (j != 0) {
                        str0 += ', ';
                        str1 += ', ';
                    }

                    str0 += '`' + key + '`';
                    str1 += "'" + cursp[key] + "'";

                    ++j;
                }
            }

            let tname = 'sinajymx_' + ym + '_' + code.charAt(5);
            let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);

            fullsql += sql;
            ++sqlnums;

            if (sqlnums > SQL_BATCH_NUMS) {
                await runQuery(conn, fullsql);

                fullsql = '';
                sqlnums = 0;
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
        }

        return true;
    }

    // instrument is like EUR_USD
    // timemode is like M1
    async createOandaInstrumentTable(instrument, timemode) {
        let sql = util.format("CREATE TABLE `oanda_%s_%s` (\n" +
            "  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
            "  `realtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,\n" +
            "  `ask_o` int(11) NOT NULL,\n" +
            "  `ask_c` int(11) NOT NULL,\n" +
            "  `ask_h` int(11) NOT NULL,\n" +
            "  `ask_l` int(11) NOT NULL,\n" +
            "  `bid_o` int(11) NOT NULL,\n" +
            "  `bid_c` int(11) NOT NULL,\n" +
            "  `bid_h` int(11) NOT NULL,\n" +
            "  `bid_l` int(11) NOT NULL,\n" +
            "  `volume` int(11) NOT NULL,\n" +
            "  PRIMARY KEY (`id`),\n" +
            "  UNIQUE KEY `realtime` (`realtime`)\n" +
            ") ENGINE=MyISAM DEFAULT CHARSET=utf8;", instrument, timemode);

        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);
        await runQuery(conn, sql);
    }

    async saveOandaInstrument(tname, lst) {
        let conn = CrawlerMgr.singleton.getMysqlConn(this.mysqlid);

        let fullsql = '';
        let sqlnums = 0;

        for (let i = 0; i < lst.length; ++i) {
            let cursp = lst[i];
            let str0 = '';
            let str1 = '';

            let j = 0;
            for (let key in cursp) {
                if (cursp[key] != undefined) {
                    if (j != 0) {
                        str0 += ', ';
                        str1 += ', ';
                    }

                    str0 += '`' + key + '`';
                    str1 += "'" + cursp[key] + "'";

                    ++j;
                }
            }

            // let tname = 'sinajymx_' + ym + '_' + code.charAt(5);
            let sql = util.format("insert into %s(%s) values(%s);", tname, str0, str1);

            fullsql += sql;
            ++sqlnums;

            if (sqlnums > SQL_BATCH_NUMS) {
                await runQuery(conn, fullsql);

                fullsql = '';
                sqlnums = 0;
            }
        }

        if (sqlnums > 0) {
            await runQuery(conn, fullsql);
        }

        return true;
    }
};

FinanceMgr.singleton = new FinanceMgr();

exports.FinanceMgr = FinanceMgr;