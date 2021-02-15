var fs = require('fs'),
    path = require('path');

var languageList = require('../lang.js');
var credentials = require('../credentials.js');

function GetWorkingLanguages(){
    var LangWorkingCatalog = [];
            
    var items = fs.readdirSync(credentials.WorkSetLangPath); 
    
    for (var i=0; i<items.length; i++) {
        var NewEntry = languageList.find(o => o.code === items[i].substring(0, 2));
        LangWorkingCatalog.push(NewEntry);
    }
    console.log(LangWorkingCatalog);
    return LangWorkingCatalog;
};

module.exports.GetWorkingLanguages = GetWorkingLanguages;