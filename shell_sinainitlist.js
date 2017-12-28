logger('info', 'exec sinainitlist...');

if (shell.which('node')) {
    logger('info', 'node ./bin/sinainitlist.js');
    shell.exec("node ./bin/sinainitlist.js");
}

logger('info', 'exec sinainitlist end.');