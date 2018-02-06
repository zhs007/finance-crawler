"use strict";

const { startTask, initDailyRotateFileLog, log } = require('jarvis-task');

async function runQuery(conn, sql) {
    let [rows, fields] = await conn.query(sql).catch((err) => {
        log('err', sql);
        log('err', err.toString());
    });

    return rows;
}

exports.runQuery = runQuery;