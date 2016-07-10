#!/usr/bin/env node
 //please note that this only supports file, no content can be put here

var fs = require('fs');
var exec = require('child_process').exec;
var formatter = require('./formatter');




var timeStamp = Date.now();
var fileNamePrefix = '/tmp/code-differ-' + timeStamp

var fileName1 = process.argv[2];
var fileName2 = process.argv[3];
var differTool = process.argv[4] || 'opendiff $file1 $file2'; //fall back to vimdiff


//this will work with file path
formatter(fileName1).then(function(formattedContent1) {
    formatter(fileName2).then(function(formattedContent2) {
        //these are mainly for output name stored in /tmp/...
        var outFileName1 = fileNamePrefix + '.left';
        var outFileName2 = fileNamePrefix + '.right';

        fs.writeFile(outFileName1, formattedContent1);
        fs.writeFile(outFileName2, formattedContent2);

        var diffToolCmd = differTool.replace('$file1', '"' + outFileName1 + '"')
            .replace('$file2', '"' + outFileName2 + '"');

        console.log('outFileName1: ', outFileName1);
        console.log('outFileName2: ', outFileName2);
        console.log('====');
        console.log(diffToolCmd);

        //execute the differ command
        exec(diffToolCmd);
    });
});
