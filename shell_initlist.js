log('info', 'exec initlist...');

if (shell.which('node')) {
    log('info', 'node ./bin/initlist.js');
    shell.exec("node ./bin/initlist.js");
}

log('info', 'exec initlist end.');