noticemsg('exec sinainitlist...');

if (shell.which('node')) {
    noticemsg('node ./bin/sinainitlist.js');
    shell.exec("node ./bin/sinainitlist.js");
}

noticemsg('exec sinainitlist end.');