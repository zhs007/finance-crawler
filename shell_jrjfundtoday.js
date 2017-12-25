noticemsg('exec jrjfundtoday...');

if (shell.which('node')) {
    noticemsg('node ./bin/jrjfundtoday.js');
    shell.exec("node ./bin/jrjfundtoday.js");
}

noticemsg('exec jrjfundtoday end.');