#!/usr/bin/env node

var formatter = require('./formatter');
formatter(process.argv[2]).then(function(formattedContent) {
    console.log(formattedContent);
});
