log('info', 'exec sinainitlist...');

if (shell.which('node')) {
    log('info', 'node ./bin/sinainitlist.js');
    shell.exec("node ./bin/sinainitlist.js");
}

log('info', 'exec sinainitlist end.');