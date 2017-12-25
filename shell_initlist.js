noticemsg('exec initlist...');

if (shell.which('node')) {
    noticemsg('node ./bin/initlist.js');
    shell.exec("node ./bin/initlist.js");
}

noticemsg('exec initlist end.');