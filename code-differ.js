#!/usr/bin/env node
 //please note that this only supports file, no content can be put here

var fs = require('fs');
var Promise = require('promise');
var exec = require('child_process').exec;
var formatter = require('./formatter');




var timeStamp = Date.now();
var fileNamePrefix = '/tmp/code-differ-' + timeStamp

var differTool = process.argv[4] || 'opendiff $file1 $file2'; //fall back to vimdiff

//if inputs are file
var fileName1 = process.argv[2];
var fileName2 = process.argv[3];


//if input are commit hash
var commitHash = process.argv[2];
var fileName = process.argv[3];

var isFileMode = commitHash.length !== 7 && commitHash.length !== 40; //sha hash is either 7 or 40 (long or short)

//this will work with file path
new Promise(function(fulfill, reject) {
    //first try reading input as files
    if (isFileMode === true) {
        formatter(fileName1).then(function(formattedContent1) {
            formatter(fileName2).then(function(formattedContent2) {
                fulfill([formattedContent1, formattedContent2]);
            })
        });
    } else {
        //format the path for filename
        fileName = fileName;

        //sha to compare
        var sha1 = commitHash;
        var sha2 = commitHash + '^'

        //need to retry as commit hash
        var gitCatFileCmd1 = 'git cat-file blob ' + sha1 + ':./' + fileName;
        var gitCatFileCmd2 = 'git cat-file blob ' + sha2 + '^:./' + fileName;

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

        console.log('====');
        console.log('outFileName1: ', outFileName1);
        console.log('outFileName2: ', outFileName2);
        console.log('====');
        console.log(diffToolCmd);

        //execute the differ command
        exec(diffToolCmd);
    });
