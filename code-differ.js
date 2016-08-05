#!/usr/bin/env node

//please note that this only supports file, no content can be put here
var fs = require('fs');
var Promise = require('promise');
var exec = require('child_process').exec;
var formatter = require('./formatter');

var isFileMode = true;
var validArguments = process.argv.filter( function(arg, idx){
    switch(arg.toLowerCase()){
        case '-s':
        case '--s':
        case '-sha':
        case '--sha':
        case '-g':
        case '--git':
            isFileMode = false;
            break;
        default:
            if(arg.indexOf('$file1 $file2') > 0){
                //diff mode is passed, use it
                diff
            }
            break;
    }

    return idx >= 2 && arg.indexOf('--') !== 0
});

if(validArguments.length === 0){
    return console.log('file or sha is needed for code formatter');
}

//code-differ -f /tmp/test1 /tmp/test2
if(isFileMode){
    inFileName1 = validArguments[0];
    inFileName2 = validArguments[1];

    if(!inFileName1 || !inFileName2){
        return console.log('file mode requires both inFileName1 and inFileName2');
    }
} else {
    //2 sha or 1 sha
    //code-differ -s /tmp/test sha
    if(validArguments[0].indexOf('/') >= 0){
        //on a file with a sha : compare sha and sha^
        fileName = validArguments[0];
        sha1 = validArguments[1];
        sha2 = validArguments[2] || sha1 + '^';
    }

    if(!sha1 || !sha2){
        return console.log('file mode requires both sha1 and sha2');
    }
}

//get difftool
var differTool = differTool || 'vimdiff $file1 $file2'; //fall back to vimdiff

//this will work with file path
new Promise(function(fulfill, reject) {
    //first try reading input as files
    if (isFileMode === true) {
        console.log('Diffing Files');
        console.log('====Input');
        console.log('inFileName1', inFileName1);
        console.log('inFileName2', inFileName2);

        formatter(inFileName1).then(function(formattedContent1) {
            formatter(inFileName2).then(function(formattedContent2) {
                fulfill([formattedContent1, formattedContent2]);
            })
        });
    } else {
        console.log('Diffing SHA');
        console.log('====Input');

        console.log('sha1', sha1);
        console.log('sha2', sha2);

        //format the path for filename
        fileName = fileName;

        //need to retry as commit hash
        var gitCatFileCmd1 = 'git cat-file blob ' + sha1 + ':./' + fileName;
        var gitCatFileCmd2 = 'git cat-file blob ' + sha2 + ':./' + fileName;

        exec(gitCatFileCmd1, function(err1, formattedContent1) {
            exec(gitCatFileCmd2, function(err2, formattedContent2) {
                fulfill([formattedContent1, formattedContent2]);
            })
        })
    }
})
    .then(function(formattedContents) {
        var formattedContent1 = formattedContents[0] || '';
        var formattedContent2 = formattedContents[1] || '';

        if (formattedContent1.length === 0 && formattedContent2.length === 0) {
            return console.log('Nothing to compare, both side are empty string');
        }

        //generate the random file prefix
        //for the diff
        var timeStamp = Date.now();
        var fileNamePrefix = '/tmp/code-differ-' + timeStamp;

        //these are mainly for output name stored in /tmp/...
        var outFileName1 = fileNamePrefix + '.left';
        var outFileName2 = fileNamePrefix + '.right';

        fs.writeFile(outFileName1, formattedContent1);
        fs.writeFile(outFileName2, formattedContent2);

        var diffToolCmd = differTool.replace('$file1', '"' + outFileName1 + '"')
            .replace('$file2', '"' + outFileName2 + '"');

        console.log('====output');
        console.log('outFileName1: ', outFileName1);
        console.log('outFileName2: ', outFileName2);
        console.log('====diff command');
        console.log(diffToolCmd);

        //execute the differ command
        exec(diffToolCmd);

        //exit no matter what
        setTimeout(process.exit, 1000);
    });
