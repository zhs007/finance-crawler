log('info', 'exec sinastocktoday...');

if (shell.which('node')) {
    log('info', 'node ./bin/sinastocktoday.js');
    shell.exec("node ./bin/sinastocktoday.js");
}

log('info', 'exec sinastocktoday end.');