//credentials used in the app
var credentials = require('../credentials.js');

var fs = require('fs'),
    path = require('path');

//logging system
var log = require('./log.js');

var xpath   = require('xpath');
var Dom     = require('xmldom').DOMParser;

//natural laguage processing libraries 
var NaturalNLP = require('natural');
var sw = require('stopword');
var pluralize = require('pluralize');
var Sentiment = require('sentiment');

function CrawlPreAssessment(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var Sentence = '';
    var doc = new Dom().parseFromString(data);
    
    var vElements = xpath.select("//paElement/val/tx[@l='" + selectedLang + "']/@name",doc);
    for (var m=0; m<vElements.length; m++) {
        if (!(vElements[m].nodeValue == '' || vElements[m].nodeValue == 'Yes' || vElements[m].nodeValue == 'No' || vElements[m].nodeValue == 'Low' || vElements[m].nodeValue == 'Medium' || vElements[m].nodeValue == 'High')){
            fs.appendFileSync(CrawlerFileId, vElements[m].nodeValue +'\n');
        }
    }
};

function CrawlPlan(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var Sentence = '';
    var newSentence = '';
    var doc = new Dom().parseFromString(data);

    var vItems = xpath.select("//Issue[@Include='Yes']/@Remarks",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }

    var vItems = xpath.select("//Issue[@Include='Yes']/Matrix/Objectives/obj/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
    Sentence = '';
    var vItems = xpath.select("//Issue[@Include='Yes']/Matrix/Criteria/cri/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
    Sentence = '';
    var vItems = xpath.select("//Issue[@Include='Yes']/Matrix/InformationRequired/inf/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
    Sentence = '';
    var vItems = xpath.select("//Issue[@Include='Yes']/Matrix/AnalysisMethod/anm/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
    Sentence = '';
    var vItems = xpath.select("//Issue[@Include='Yes']/Matrix/foundPreviously/fp/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
    Sentence = '';
    var vItems = xpath.select("//Matrix/Conclusion/clu/tx[@l='" + selectedLang + "']/@name",doc);
    for (var i=0; i<vItems.length; i++) {
        if (!(vItems[i].nodeValue == '' || vItems[i].nodeValue == 'Yes' || vItems[i].nodeValue == 'No' || vItems[i].nodeValue == 'Low' || vItems[i].nodeValue == 'Medium' || vItems[i].nodeValue == 'High'|| vItems[i].nodeValue == 'To be developed' || vItems[i].nodeValue == 'To be filled in by auditor')){
            newSentence = vItems[i].nodeValue  +'.\n';
            newSentence = newSentence.replace('..\n','.\n');
            if (Sentence != newSentence){
                Sentence = newSentence;
                fs.appendFileSync(CrawlerFileId, newSentence);
            }
        }
    }
};

function CrawlFindings(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var Sentence = '';
    var doc = new Dom().parseFromString(data);

    var vElements = xpath.select("//Cases/Case/quote",doc);
    for (var m=0; m<vElements.length; m++) {
        if (vElements[m].nodeValue != null){
            Sentence= vElements[m].firstChild.nodeValue;
        } else{
            Sentence = '';
        }
        if (!(Sentence == '' || Sentence == 'Yes' || Sentence == 'No' || Sentence == 'Low' || Sentence == 'Medium' || Sentence == 'High')){
            fs.appendFileSync(CrawlerFileId, Sentence +'\n');
        }
    }
    
};

function CrawlRecommendations(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var Sentence = '';
    var doc = new Dom().parseFromString(data);

    var vElements = xpath.select("//Recommendations/Recommendation/quote",doc);
    for (var m=0; m<vElements.length; m++) {
        if (vElements[m].nodeValue != null){
            Sentence= vElements[m].firstChild.nodeValue;
        } else{
            Sentence = '';
        }
        fs.appendFileSync(CrawlerFileId, Sentence +'\n');
    }
    
};

function LoadCrawler(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    // Create an XMLDom Element:
    var Sentence = '';
    var doc = new Dom().parseFromString(data);
    
    //Crawl reference and creates crawler file as nlp source file
    var res = xpath.select("/Audit/About/title/tx[@l='" + selectedLang + "']/@name",doc);
    if (res.length==1 && res[0] != null)
        Sentence = res[0].nodeValue + '\n';

    var res = xpath.select("/Audit/Background/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        Sentence =  Sentence + res[0].firstChild.nodeValue + '\n';

    var res = xpath.select("/Audit/Scope/ak",doc);
    if (res.length==1 && res[0].firstChild != null)
        Sentence =  Sentence + res[0].firstChild.nodeValue + '\n';

    fs.writeFileSync(CrawlerFileId, Sentence);            

    CrawlPreAssessment(Auditfileid, CrawlerFileId);
    CrawlPlan(Auditfileid, CrawlerFileId);
    CrawlFindings(Auditfileid, CrawlerFileId);
    CrawlRecommendations(Auditfileid, CrawlerFileId);

    return CrawlerFileId;
};

function LoadNLPProcessing(CrawlerFileId, TokenFileId, VectorFile) {
    var NewDictFile = credentials.WorkSetPath;
    NewDictFile = NewDictFile + 'gazetteer.dic';
    var data = fs.readFileSync(NewDictFile, { encoding : 'UTF-8' });
    var keywords = data.split('\n');

    var StoredMatches = [];
    var VectorTerms = [];

    var data = fs.readFileSync(CrawlerFileId, { encoding : 'UTF-8' });

    //tokenize and normalize (to lower case)
    var tokenizer = new NaturalNLP.WordPunctTokenizer();
    var tokens = tokenizer.tokenize(data);
    fs.writeFileSync(TokenFileId, tokens.toString().toLowerCase());

    //tokenizing problems: filter hyphens, apostrophes, diacritc letters, other characters and ponctuations
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    data = data.replace(/,.,/g, ',,'); 
    data = data.replace(/,%,/g, ',,'); 
    data = data.replace(/,,,/g, ',,'); 
    data = data.replace(/,-,/g, ',,'); 
    data = data.replace(/\)/g, ',,'); 
    data = data.replace(/\(/g, ',,'); 
    data = data.replace(/[0-9]/g, '');
    data = data.replace(/,...,/g, ',,'); 
    data = data.replace(/,.,/g, ',,'); 
    data = data.replace(/,,,/g, ',,'); 
    data = data.replace(/,,/g, ','); 
    fs.writeFileSync(TokenFileId, data);

    //remove stopwords
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    var oldString = data.split(',');
    var newString = sw.removeStopwords(oldString);
    fs.writeFileSync(TokenFileId,newString.join());

    //gazetteer 1st cycle, with combine
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    data = data.replace(/,/g, ' '); 
    for (i=0; i< keywords.length; i++){
        var keyword = keywords[i].split('|');
        if (data.indexOf(keyword[0]) > -1) {
            if (StoredMatches.includes(keywords[i]) == false) {
                StoredMatches.push(keywords[i]);
            }
        }
    }   
    
    //lemmatization and stemming: not used, too much errors
    //var stemmer = NaturalNLP.PorterStemmer;

    //singularize tokens
    //var nounInflector = new NaturalNLP.NounInflector();
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    var tokens = data.split(',');
    for (i=0; i< tokens.length; i++){
        //tokens[i]=stemmer.stem(tokens[i]);
        tokens[i]=pluralize.singular(tokens[i]);
        //if (tokens[i] > 0) {
        //    tokens[i]=nounInflector.singularize(tokens[i]);
        //}
    }   
    fs.writeFileSync(TokenFileId, tokens.join());

    //gazetteer 2nd cycle, with combine
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    data = data.replace(/,/g, ' '); 
    for (i=0; i< keywords.length; i++){
        var keyword = keywords[i].split('|');
        if (data.indexOf(keyword[0]) > -1) {
            if (StoredMatches.includes(keywords[i]) == false) {
                StoredMatches.push(keywords[i]);
            }
        }
    }   

    //featurize
    //1. Term weighting: frequency of occurrence in stored tokens extracted from gazetteers
    var TfIdf = NaturalNLP.TfIdf;
    var tfidf = new TfIdf();
    var data = fs.readFileSync(TokenFileId, { encoding : 'UTF-8' });
    data = data.replace(/,/g, ' '); 
    tfidf.addDocument(data);

    for (i=0; i< StoredMatches.length; i++){
        var keyword = StoredMatches[i].split('|');
        var Token = {
            Name: keyword[0],
            Label: keyword[1],
            Weight: tfidf.tfidf(keyword[0], 0)
        };
        VectorTerms.push(Token);
    }

    //2. Classify (unknown text in categories, through training)
    //open but not develop now
    fs.writeFileSync(VectorFile, JSON.stringify(VectorTerms));
};

var sort_by = function(field, reverse, primer){

    var key = primer ? 
        function(x) {return primer(x[field])} : 
        function(x) {return x[field]};

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    } 
};

function GetVector(VectorFile) {
    var data = JSON.parse(fs.readFileSync(VectorFile, { encoding : 'UTF-8' }));
    //sort array by term weight
    //data.sort((a, b) => parseFloat(a.Weight) - parseFloat(b.Weight));
    return data.sort(sort_by('Weight', true, parseFloat));  
};

function GetCypherQuery(VectorFile) {
    var data = GetVector(VectorFile);  
    var TotalTokens=0;
    var CypherQuery = "";
    var WhereQuery ="";

    if (data.length > 4) {
        TotalTokens = 4;
    } else {
        TotalTokens = data.length;
    }

    CypherQuery = "MATCH (a1:Audit)-[r1:COVER|PERFORM|PRODUCED|ACHIEVE|DETERMINE|EVALUATE|ADDRESS|IDENTIFIED]-(n1) WHERE ";
    for (i=0; i < TotalTokens; i++){
        if (WhereQuery != ''){
            WhereQuery = WhereQuery + " OR ";
        }
        WhereQuery = WhereQuery + "n1.Definition = '" + data[i].Name + "'";
        /*
        if (CypherQuery != ''){
            CypherQuery = CypherQuery + " UNION ";
        }
        if (data[i].Label == 'Topics'){
            CypherQuery = CypherQuery + "MATCH (n1:Topics {Definition: '" + data[i].Name + "'})-[r:COVER]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Country'){
            CypherQuery = CypherQuery + "MATCH (n1:Country {Name: '" + data[i].Name + "'})-[r:PRODUCED]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Function'){
            CypherQuery = CypherQuery + "MATCH (n1:Function {Definition: '" + data[i].Name + "'})-[r:PERFORM]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Goal'){
            CypherQuery = CypherQuery + "MATCH (n1:Goal {Definition: '" + data[i].Name + "'})-[r:ACHIEVE]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Impact'){
            CypherQuery = CypherQuery + "MATCH (n1:Impact {Definition: '" + data[i].Name + "'})-[r:DETERMINE]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Process'){
            CypherQuery = CypherQuery + "MATCH (n1:Process {Definition: '" + data[i].Name + "'})-[r:EVALUATE]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Requirement'){
            CypherQuery = CypherQuery + "MATCH (n1:Requirement {Definition: '" + data[i].Name + "'})-[r:DETERMINE]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'ActivityDomain'){
            CypherQuery = CypherQuery + "MATCH (n1:ActivityDomain {Definition: '" + data[i].Name + "'})-[r:ADDRESS]-(a1:Audit) return n1, r, a1 LIMIT 10";
        } else if (data[i].Label == 'Risk_Case'){
            CypherQuery = CypherQuery + "MATCH (n1:Risk_Case {Definition: '" + data[i].Name + "'})-[r:IDENTIFIED]-(a1:Audit) return n1, r, a1 LIMIT 10";
        }*/
    }
    CypherQuery = CypherQuery + WhereQuery;
    CypherQuery = CypherQuery + " WITH a1, count(n1) as weight, collect(n1) as rels ";
    CypherQuery = CypherQuery + "ORDER BY weight DESC LIMIT 20 ";
    CypherQuery = CypherQuery + "MATCH (a1:Audit)-[r:COVER|PERFORM|PRODUCED|ACHIEVE|DETERMINE|EVALUATE|ADDRESS|IDENTIFIED]-(n1) WHERE "
    CypherQuery = CypherQuery + WhereQuery;
    CypherQuery = CypherQuery + " RETURN a1, r, n1"   
    return CypherQuery;
};

function GetTableQuery(VectorFile) {
    var data = GetVector(VectorFile);  
    var TotalTokens=0;
    var CypherQuery = "";
    var WhereQuery ="";

    if (data.length > 4) {
        TotalTokens = 4;
    } else {
        TotalTokens = data.length;
    }

    CypherQuery = "MATCH (a1:Audit)-[r1:COVER|PERFORM|PRODUCED|ACHIEVE|DETERMINE|EVALUATE|ADDRESS|IDENTIFIED]-(n1) WHERE ";
    for (i=0; i < TotalTokens; i++){
        if (WhereQuery != ''){
            WhereQuery = WhereQuery + " OR ";
        }
        WhereQuery = WhereQuery + "n1.Definition = '" + data[i].Name + "'";
        /*
        //old query
        //
        if (CypherQuery != ''){
            CypherQuery = CypherQuery + " UNION ";
        }
        if (data[i].Label == 'Topics'){
            CypherQuery = CypherQuery + "MATCH (n1:Topics {Definition: '" + data[i].Name + "'})-[r:COVER]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Country'){
            CypherQuery = CypherQuery + "MATCH (n1:Country {Name: '" + data[i].Name + "'})-[r:PRODUCED]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Function'){
            CypherQuery = CypherQuery + "MATCH (n1:Function {Definition: '" + data[i].Name + "'})-[r:PERFORM]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Goal'){
            CypherQuery = CypherQuery + "MATCH (n1:Goal {Definition: '" + data[i].Name + "'})-[r:ACHIEVE]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Impact'){
            CypherQuery = CypherQuery + "MATCH (n1:Impact {Definition: '" + data[i].Name + "'})-[r:DETERMINE]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Process'){
            CypherQuery = CypherQuery + "MATCH (n1:Process {Definition: '" + data[i].Name + "'})-[r:EVALUATE]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Requirement'){
            CypherQuery = CypherQuery + "MATCH (n1:Requirement {Definition: '" + data[i].Name + "'})-[r:DETERMINE]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'ActivityDomain'){
            CypherQuery = CypherQuery + "MATCH (n1:ActivityDomain {Definition: '" + data[i].Name + "'})-[r:ADDRESS]-(a1:Audit) return n1, a1 LIMIT 10";
        } else if (data[i].Label == 'Risk_Case'){
            CypherQuery = CypherQuery + "MATCH (n1:Risk_Case {Definition: '" + data[i].Name + "'})-[r:IDENTIFIED]-(a1:Audit) return n1, a1 LIMIT 10";
        }
        */
    }
    CypherQuery = CypherQuery + WhereQuery;
    CypherQuery = CypherQuery + " WITH a1, count(n1) as weight, collect(n1) as rels ";
    CypherQuery = CypherQuery + "RETURN a1, rels ORDER BY weight DESC LIMIT 20";

    return CypherQuery;
};

function NLPSentimentFindings(Auditfileid, CrawlerFileId, selectedLang = credentials.WorkLang) {
    var data = fs.readFileSync(Auditfileid, { encoding : 'UTF-8' });
    //tokenize and normalize (to lower case)
    var tokenizer = new NaturalNLP.SentenceTokenizer();
    // Create an XMLDom Element:
    var Sentence = '';
    var doc = new Dom().parseFromString(data);

    Vector=[];
    Catalog = [];
    var GeneralCounter = 1;

    var vCurrentFinding ='';
    var vScoreFinding =0;
    var vNumberSentencesFinding=0;
    var vNumber=0;

    var sentiment = new Sentiment();

    var vElements = xpath.select("/Audit/Cases/Case/@nr",doc);
    for (var m=0; m<vElements.length; m++) {
        if (xpath.select("/Audit/Cases/Case[@nr='" + vElements[m].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild === null){
            Sentence = '';
        } else {
            Sentence= xpath.select("/Audit/Cases/Case[@nr='" + vElements[m].nodeValue + "']/quote[@type='description']/.",doc)[0].firstChild.nodeValue;
        }
        if (vCurrentFinding != vElements[m].nodeValue){
            if (vCurrentFinding ==''){
                vCurrentFinding = vElements[m].nodeValue;
                vScoreFinding =0;
                vNumberSentencesFinding=0;
            } else{
                if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vCurrentFinding + "']/@number)",doc)){
                    vNumber = xpath.select("/Audit/Cases/Case[@nr='" + vCurrentFinding + "']/@number",doc)[0].nodeValue
                } else {
                    vNumber=0;
                };
                var NewFinding ={
                    Id: vCurrentFinding,
                    Number: vNumber,
                    Sentence: vNumberSentencesFinding,
                    Score: (vScoreFinding / vNumberSentencesFinding)
                };
                Vector.push(NewFinding);
                vCurrentFinding =vElements[m].nodeValue;
                vScoreFinding =0;
                vNumberSentencesFinding=0;
            }
        }
        if (!(Sentence == null) && !(Sentence == '' || Sentence == 'Yes' || Sentence == 'No' || Sentence == 'Low' || Sentence == 'Medium' || Sentence == 'High')){
            var tokens=[];
            try {
                tokens = tokenizer.tokenize(Sentence);
            }catch(err){
                tokens=[];
            }

            if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vElements[m].nodeValue + "']/@number)",doc)){
                vNumber = xpath.select("/Audit/Cases/Case[@nr='" + vElements[m].nodeValue + "']/@number",doc)[0].nodeValue
            } else {
                vNumber=0;
            };
            for (var i=0; i < tokens.length; i++){
                var result = sentiment.analyze(tokens[i]);
                var NewEntry = {
                    RowId: GeneralCounter,
                    Id: vElements[m].nodeValue,
                    Number: vNumber,
                    Sentence: tokens[i],
                    Score: result.comparative
                }
                vScoreFinding = vScoreFinding + result.comparative;
                vNumberSentencesFinding++;
                Catalog.push(NewEntry); 
                GeneralCounter++;
            }
        }
    }
    if (xpath.select("boolean(/Audit/Cases/Case[@nr='" + vCurrentFinding + "']/@number)",doc)){
        vNumber = xpath.select("/Audit/Cases/Case[@nr='" + vCurrentFinding + "']/@number",doc)[0].nodeValue
    } else {
        vNumber=0;
    };
    var NewFinding ={
        Id: vCurrentFinding,
        Number: vNumber,
        Sentence: vNumberSentencesFinding,
        Score: (vScoreFinding / vNumberSentencesFinding)
    };
    Vector.push(NewFinding);
    
    fs.writeFileSync(CrawlerFileId, JSON.stringify(Catalog));    
    return Vector;
};

function NLPSentimentFindingsDetailed(CrawlerFileId, FindigId, selectedLang = credentials.WorkLang) {
    var data = JSON.parse(fs.readFileSync(CrawlerFileId, { encoding : 'UTF-8' }));

    Vector=[];

    for (var m=0; m<data.length; m++) {
        if (FindigId == data[m].Id){
            /*var NewFinding ={
                Id: data[m].Id,
                RowId: data[m].RowId,
                Sentence: data[m].Sentence,
                Score: data[m].Score
            };
            Vector.push(NewFinding);*/
            Vector.push(data[m]);
        }
    }
    return Vector;
};

module.exports.LoadCrawler = LoadCrawler;
module.exports.LoadNLPProcessing = LoadNLPProcessing;
module.exports.GetVector = GetVector;
module.exports.GetCypherQuery = GetCypherQuery;
module.exports.GetTableQuery = GetTableQuery;
module.exports.sort_by = sort_by;
module.exports.NLPSentimentFindings = NLPSentimentFindings;
module.exports.NLPSentimentFindingsDetailed = NLPSentimentFindingsDetailed;