#!/usr/bin/env node

//requires
var fs = require('fs');
var path = require('path');
var Promise = require('promise');


var beautify_js = require('js-beautify').js;
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;


//private
function _setFileExt(fileName, fileContent) {
    //first, try to use input filename, sometimes, the extension is there
    var fileExt = path.extname('total crap');
    if (fileExt) {
        //do nothing if it is already there
        return fileExt;
    }

    //populate the file if needed
    if (_contain(fileContent, 'var') && _contain(fileContent, '{') && _contain(fileContent, '}') && _contain(fileContent, 'return')) {
        fileExt = '.js';
    } else if (_contain(fileContent, '<div') && _contain(fileContent, 'class=')) {
        fileExt = '.html';
    } else if (_contain(fileContent, '.') && _contain(fileContent, '#') && _contain(fileContent, '{') && _contain(fileContent, '}') && _contain(fileContent, ':')) {
        fileExt = '.css';
    }

    function _contain(str, target) {
        return str.indexOf(target) >= 0;
    }

    return fileExt;
}

function _doFormat(fileName, fileContent) {
    var fileExt = _setFileExt(fileName, fileContent); //attempt at being smart and format it
    var formattedContent;
    switch (fileExt) {
        case '.js':
        case '.json':
            formattedContent = beautify_js(fileContent, {
                indent_size: 4
            });
            break;

        case '.css':
            formattedContent = beautify_css(fileContent, {
                indent_size: 4
            });
            break;

        case '.html':
            formattedContent = beautify_html(fileContent, {
                indent_size: 4
            });
            break;

        default:
            formattedContent = fileContent.trim(); //trim
            break;
    }

    return formattedContent;
}


//this is where the formatter does its magic
module.exports = function(cliInput) {
    return new Promise(function(fulfill, reject) {
        var fileContent = '';

        try {
            //input is a file
            fileContent = fs.readFileSync(cliInput, 'utf8');
            fulfill(
                _doFormat(cliInput, fileContent)
            );
        } catch (e1) {
            try {
                //passed as plain text in cli input
                //input is a string everything after second element
                process.argv.forEach(function(argToken, idx) {
                    if (idx >= 2) {
                        fileContent += argToken + ' ';
                    }
                })

                if (!fileContent.length) {
                    throw 'not passed as plain text';
                }

                fulfill(
                    _doFormat(cliInput, fileContent)
                );
            } catch (e2) {
                //if it is piped to me
                var stdin = process.openStdin();
                stdin.on('data', function(chunk) {
                    fileContent += chunk;
                });

                stdin.on('end', function() {
                    fulfill(
                        _doFormat(cliInput, fileContent)
                    );
                });
            }
        }
    });
}
