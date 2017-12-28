log('info', 'exec jrjfundtoday...');

if (shell.which('node')) {
    log('info', 'node ./bin/jrjfundtoday.js');
    shell.exec("node ./bin/jrjfundtoday.js");
}

log('info', 'exec jrjfundtoday end.');