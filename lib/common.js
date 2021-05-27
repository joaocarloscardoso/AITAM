//credentials used in the app
var credentials = require('../credentials.js');

//example call:
//var appObjects = appLang.GetData(req.session.lang);
//console.log(common.CreateArrayString(appObjects.ListsOfValues.Recommendation.RiskCharacterization, "name"));
//console.log(common.CreateArrayString(appObjects.ListsOfValues.Recommendation.RiskCharacterization, "value"));

function CreateArrayString(jsonLangListOfValues, element) {
    var x='';
    
    for (i in jsonLangListOfValues) {
        x += jsonLangListOfValues[i][element] + '|';
    }

    return x.substring(0, (x.length-1));  
};

function GetUser(req) {
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };
    return user;
};

function GetLang(req) {
    var lang = '';
    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            lang=credentials.WorkLang;
        } else {
            lang=req.session.lang;
        };
    } catch (error) {
        lang=credentials.WorkLang;
    };
    return lang;
};

function CleanXMLEntities(xString) {
    return xString.replaceAll("'","&apos;").replaceAll('"',"&quot;").replaceAll('&',"&amp;").replaceAll('>',"&gt;").replaceAll('<',"&lt;");
};

module.exports.CreateArrayString = CreateArrayString;
module.exports.GetUser = GetUser;
module.exports.GetLang = GetLang;
module.exports.CleanXMLEntities = CleanXMLEntities;