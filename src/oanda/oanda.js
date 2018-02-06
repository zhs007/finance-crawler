"use strict";

const Context = require('@oanda/v20/context').Context;

function createContext(hostname, port, ssl, appname, token) {
    let ctx = new Context(hostname, port, ssl, appname);

    ctx.setToken(token);

    return ctx;
}

exports.createContext = createContext;