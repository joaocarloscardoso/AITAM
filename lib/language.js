var fs = require('fs'),
    path = require('path');

var languageList = require('../lang.js');
var credentials = require('../credentials.js');

function GetWorkingLanguages(AuditLanguages){
    var LangWorkingCatalog = [];
            
    var items = fs.readdirSync(credentials.WorkSetLangPath); 
    
    if (AuditLanguages == '') {
        for (var i=0; i<items.length; i++) {
            var NewEntry = languageList.find(o => o.code === items[i].substring(0, 3));
            LangWorkingCatalog.push(NewEntry);
        };
    } else {
        var arLanguages = AuditLanguages.split(" ");
        for (var i=0; i<items.length; i++) {
            var NewEntry = languageList.find(o => o.code === items[i].substring(0, 3));
            for (j = 0; j < arLanguages.length; j++) {
                if (JSON.stringify(NewEntry).indexOf(arLanguages[j])  !== -1){
                    LangWorkingCatalog.push(NewEntry);
                    break;
                }
            };
        };
    }
    //console.log(LangWorkingCatalog);
    return LangWorkingCatalog;
};

function GetData(langFile){
    var jsonFile = credentials.WorkSetLangPath;
    jsonFile = jsonFile + '\\' + langFile + '.json';
    var data = JSON.parse(fs.readFileSync(jsonFile, { encoding : 'UTF-8' }));
    return data;
};

module.exports.GetWorkingLanguages = GetWorkingLanguages;
module.exports.GetData = GetData;
