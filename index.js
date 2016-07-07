#!/usr/bin/env node

//requires
var fs = require('fs');
var path = require('path');

//
var beautify_js = require('js-beautify').js;
var beautify_css = require('js-beautify').css;
var beautify_html = require('js-beautify').html;

//
var cliInput = process.argv[2];
var fileExt = path.extname(cliInput);
var fileContent = '';

try{
    //input is a file
    fileContent = fs.readFileSync( cliInput, 'utf8');
    _doFormat();
}catch(e1){
    try{
        //passed as plain text in cli input
        //input is a string everything after second element
        process.argv.forEach(function(argToken, idx){
            if (idx >= 2){
                fileContent += argToken + ' ';
            }
        })

        if(!fileContent.length){
            throw 'not passed as plain text';
        }

        _doFormat();
    }catch(e2){
        //if it is piped to me
        var stdin = process.openStdin();
        stdin.on('data', function(chunk) {
          fileContent += chunk;
        });

        stdin.on('end', function() {
          _doFormat();
        });
    }


}




//private
function _setFileExt(){
    if(fileExt){
        //do nothing if it is already there
        return;
    }

    //populate the file if needed
    if(_contain( fileContent, 'var') && _contain( fileContent, '{')  && _contain( fileContent, '}') && _contain( fileContent, 'return')){
        fileExt = '.js';
    }
    else if(_contain( fileContent, '<div') && _contain( fileContent, 'class=')){
        fileExt = '.html';
    } else if(_contain( fileContent, '.') && _contain( fileContent, '#') && _contain( fileContent, '{') && _contain( fileContent, '}') && _contain( fileContent, ':')){
        fileExt = '.css';
    }

    function _contain(str, target){
        return str.indexOf(target) >= 0;
    }
}

function _doFormat(){
    _setFileExt();
    var formattedContent;
    switch(fileExt){
        case '.js':
        case '.json':
            formattedContent = beautify_js( fileContent, { indent_size: 4 });
            break;

        case '.css':
            formattedContent = beautify_css( fileContent, { indent_size: 4 } );
            break;

        case '.html':
            formattedContent = beautify_html( fileContent, { indent_size: 4 } );
            break;

        default:
            formattedContent = fileContent.trim();//trim
            break;
    }

    console.log(formattedContent);
}
