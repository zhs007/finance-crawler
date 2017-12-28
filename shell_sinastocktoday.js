logger('info', 'exec sinastocktoday...');

if (shell.which('node')) {
    logger('info', 'node ./bin/sinastocktoday.js');
    shell.exec("node ./bin/sinastocktoday.js");
}

logger('info', 'exec sinastocktoday end.');