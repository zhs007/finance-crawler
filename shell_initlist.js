logger('info', 'exec initlist...');

if (shell.which('node')) {
    logger('info', 'node ./bin/initlist.js');
    shell.exec("node ./bin/initlist.js");
}

logger('info', 'exec initlist end.');