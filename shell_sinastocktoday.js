noticemsg('exec sinastocktoday...');

if (shell.which('node')) {
    noticemsg('node ./bin/sinastocktoday.js');
    shell.exec("node ./bin/sinastocktoday.js");
}

noticemsg('exec sinastocktoday end.');