"use strict";

const { Task } = require('jarvis-task');
const { TASK_NAMEID_SSESTOCKLIST } = require('../taskdef');
const { FinanceMgr } = require('../financemgr');
const { startStockListCrawler } = require('./stocklist');
const { stocklistjsOptions } = require('./stocklistjs');

class TaskSSEStockList extends Task {
    constructor() {
        super(TASK_NAMEID_SSESTOCKLIST);
    }

    onStart() {
        super.onStart();

        FinanceMgr.singleton.loadSSEStockBase().then(() => {
            startStockListCrawler(async (crawler) => {
                if (crawler.options.typename == stocklistjsOptions.typename) {
                    await FinanceMgr.singleton.saveSSEStockBase();
                }

                this.onEnd();
            });
        });
    }
};

exports.TaskSSEStockList = TaskSSEStockList;
