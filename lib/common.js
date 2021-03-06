
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

module.exports.CreateArrayString = CreateArrayString;