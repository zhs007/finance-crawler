log('info', 'exec sinastockjymxtoday...');

if (shell.which('node')) {
    log('info', 'node ./bin/sinastockjymxtoday.js');
    shell.exec("node ./bin/sinastockjymxtoday.js");

    log('info', 're node ./bin/sinastockjymxtoday.js');
    shell.exec("node ./bin/sinastockjymxtoday.js");
}

log('info', 'exec sinastockjymxtoday end.');