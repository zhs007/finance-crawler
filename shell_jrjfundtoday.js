logger('info', 'exec jrjfundtoday...');

if (shell.which('node')) {
    logger('info', 'node ./bin/jrjfundtoday.js');
    shell.exec("node ./bin/jrjfundtoday.js");
}

logger('info', 'exec jrjfundtoday end.');