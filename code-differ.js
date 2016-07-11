#!/usr/bin/env node
 //please note that this only supports file, no content can be put here

var fs = require('fs');
var Promise = require('promise');
var exec = require('child_process').exec;
var formatter = require('./formatter');




var timeStamp = Date.now();
var fileNamePrefix = '/tmp/code-differ-' + timeStamp

var argLenth = process.argv.length;

//if inputs are file
var inFileName1 = process.argv[2];
var inFileName2 = process.argv[3];


//if input are commit hash
var commitHash = process.argv[2];
var fileName = process.argv[3];
var sha1 = commitHash;
var sha2 = commitHash + '^'

var isFileMode = commitHash.length !== 7 && commitHash.length !== 40; //sha hash is either 7 or 40 (long or short)
if (argLenth >= 5) {
    //when compare 2 hashes
    sha2 = process.argv[3];
    fileName = process.argv[4];
    isFileMode = false;
}

//get difftool
var differTool;
for (var i = 0; i < argLenth; i++) {
    if (process.argv[i].indexOf('$file1') >= 0 && process.argv[i].indexOf('$file2') >= 0) {
        differTool = process.argv[i]; //set it
    }
}
differTool = differTool || 'opendiff $file1 $file2'; //fall back to vimdiff


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
