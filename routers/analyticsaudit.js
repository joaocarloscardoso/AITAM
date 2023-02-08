//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('../credentials.js');
//plugins stats and catalogue
var Findings = require('../lib/findings.js');
//logging system
var log = require('../lib/log.js');
//trace system
var trace = require('../lib/audittrace.js');
//nlp
var nlp = require('../lib/nlp.js');
//multilanguage support
var appLang = require('../lib/language.js');
//nlp
var Recommendations = require('../lib/auditrec.js');
//audit maps
var AuditMap = require('../lib/auditmap.js');
//multilanguage support
var appLang = require('../lib/language.js');
//common business functions
var commonF = require('../lib/common.js');

//generation of uuid
//const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');
//session handling and store
const session = require('express-session');
const FileStore = require('session-file-store')(session);
//configure Passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//requests to users database handler
const axios = require('axios');
//module to hash passwords
const bcrypt = require('bcrypt-nodejs');
//file uploads
var formidable = require('formidable');
var fs = require("fs");

const neo4j = require('neo4j-driver');

const driver = neo4j.driver(credentials.neo4j.uri, neo4j.auth.basic(credentials.neo4j.user,credentials.neo4j.password));

var analyticsaudit = express.Router();

analyticsaudit.get('/Findings',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Findings > Analysis accessed');

        var GeneralDomainCatalog = Findings.FindingsForGeneralDomainsAnalysis(NewAuditFile, req.session.lang);
        var Domain01Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '01', req.session.lang);
        //console.log('d01');
        var Domain02Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '02', req.session.lang);
        //console.log('d02');
        var Domain03Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '03', req.session.lang);
        //console.log('d03');
        var Domain04Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '04', req.session.lang);
        //console.log('d04');
        var Domain05Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '05', req.session.lang);
        //console.log('d05');
        var Domain06Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '06', req.session.lang);
        //console.log('d06');
        var Domain07Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '07', req.session.lang);
        //console.log('d07');
        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'findings',
            AuditErrors: '',
            GeneralDomainCatalog: GeneralDomainCatalog,
            Domain01Catalog: Domain01Catalog,
            Domain02Catalog: Domain02Catalog,
            Domain03Catalog: Domain03Catalog,
            Domain04Catalog: Domain04Catalog,
            Domain05Catalog: Domain05Catalog,
            Domain06Catalog: Domain06Catalog,
            Domain07Catalog: Domain07Catalog,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            rectracking: credentials.portfolio,
            audit: status,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.get('/Recommendations',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Plan > Hints accessed (1)');

        var CrawlerFile = credentials.WorkSetPath;
        CrawlerFile = CrawlerFile + req.sessionID + '.src';
        var TokenizerFile = credentials.WorkSetPath;
        TokenizerFile = TokenizerFile + req.sessionID + '.tkn';
        var VectorFile = credentials.WorkSetPath;
        VectorFile = VectorFile + req.sessionID + '.vec';

        var vFile = nlp.LoadCrawler(NewAuditFile, CrawlerFile, req.session.lang);
        nlp.LoadNLPProcessing(CrawlerFile,TokenizerFile, VectorFile);
        var Vector = nlp.GetVector(VectorFile);

        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'recommendation',
            AuditErrors: '',
            Matrix: Vector,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.post('/Recommendations',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Plan > Hints accessed (2)');

        var VectorFile = credentials.WorkSetPath;
        VectorFile = VectorFile + req.sessionID + '.vec';
        //var CypherQuery = nlp.GetCypherQuery(VectorFile);
        var CypherTableQuery = nlp.GetTableQuery(VectorFile);
        const session = driver.session();

        session
            .run(CypherTableQuery)
            .then(result => {
                var NodeResults = [];
                //#155
                var visNodes = [];
                var visEdges =  [];
                //end #155
                result.records.forEach(function(record){
                    //create object to featurize collection (unique audits, with urls and relations)
                    //order them by number of relations desc
                    //var UniqueNodes = [];
                    /*if (NodeResults.some( Node => Node.Id === record._fields[1].identity.low)) {
                        NodeResults.find( Node => Node.Id === record._fields[1].identity.low).Number = NodeResults.find( Node => Node.Id === record._fields[1].identity.low).Number + 1;
                        NodeResults.find( Node => Node.Id === record._fields[1].identity.low).Relation = NodeResults.find( Node => Node.Id === record._fields[1].identity.low).Relation + '; ' + record._fields[0].properties.Definition;
                    } else {*/
                        //nodeid= nodeid.replace('Integer { "low: ','').replace(', high: 0 }','');
                        var vRelation='';
                        for (i=0; i < record._fields[1].length; i++)
                        {
                            vRelation = vRelation + record._fields[1][i].properties.Definition + '; ';
                            //#155
                            if (! visNodes.some(e => e.id === record._fields[1][i].identity.low)) {
                                var objTopic = {
                                    id: record._fields[1][i].identity.low,
                                    label: record._fields[1][i].properties.Definition,
                                    title: record._fields[1][i].labels[0] + ": " + record._fields[1][i].properties.Definition,
                                    shape:"dot",
                                    group:1
                                };
                                visNodes.push(objTopic);
                            };
                            var objRelation = {
                                from: record._fields[0].identity.low,
                                to: record._fields[1][i].identity.low
                            };
                            visEdges.push(objRelation);
                            //end #155
                        }
                        var objElement = {
                            Id: record._fields[0].identity.low,
                            Relation: vRelation,
                            Name: record._fields[0].properties.Title,
                            Url: record._fields[0].properties.URL,
                            Author: record._fields[0].properties.Author,
                            Year: record._fields[0].properties.Year,
                            Number:1
                        };
                        // console.log(objElement);
                        NodeResults.push(objElement);
                        //#155
                        var objAudit = {
                            id: record._fields[0].identity.low,
                            label: "Audit Report",
                            title:"Audit: " + record._fields[0].properties.Title,
                            shape:"ellipse",
                            group:0
                        };
                        visNodes.push(objAudit);
                        //end #155
                    //}
                });

                //console.log(visNodes);
                //console.log(visEdges);

                //console.log(NodeResults.sort(nlp.sort_by('Number', true, parseFloat)));
                var CypherQuery = nlp.GetCypherQuery(VectorFile);
                /*
                //old form, pre #155
                res.render('toolaudit/analyticsvis', {
                    action: 'audit',
                    operation: 'recommendationvis',
                    AuditErrors: '',
                    ServerUrl: credentials.neo4j.uriExternal,
                    ServerUser: credentials.neo4j.user,
                    ServerPassword: credentials.neo4j.password,
                    InitialCypher: CypherQuery,
                    DataTable: NodeResults.sort(nlp.sort_by('Number', true, parseFloat)),
                    msg: '',
                    auditfile: 'work/' + req.sessionID + '.xml',
                    audit: status,
                    rectracking: credentials.portfolio,
                    user: user,
                    sessionlang: req.session.lang,
                    nav: appObjects.pageNavigation
                });        
                */
                //new form, post #155 
                res.render('toolaudit/analyticsvis1', {
                    action: 'audit',
                    operation: 'recommendationvis',
                    AuditErrors: '',
                    visEdges: visEdges,
                    visNodes: visNodes,
                    DataTable: NodeResults.sort(nlp.sort_by('Number', true, parseFloat)),
                    msg: '',
                    auditfile: 'work/' + req.sessionID + '.xml',
                    audit: status,
                    rectracking: credentials.portfolio,
                    user: user,
                    sessionlang: req.session.lang,
                    nav: appObjects.pageNavigation
                });        
                session.close();  
            })
            .catch(error => {
                log.warn('Graph db error: ' + error);
            });    
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.get('/SentimentFindings',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Findings > Sentiment Analysis accessed (1)');

        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        Vector = nlp.NLPSentimentFindings(NewAuditFile, SentimentFile, req.session.lang);
        
        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'sentimentfindings',
            AuditErrors: '',
            Matrix: Vector,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user:'',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.get('/SentimentFindingsDetailed',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Findings > Sentiment Analysis accessed (2)');

        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        Vector = nlp.NLPSentimentFindingsDetailed(SentimentFile, req.query.id, req.session.lang);
        
        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'sentimentfindingsdetailed',
            AuditErrors: '',
            Matrix: Vector,
            FindingId: req.query.id,
            FindingNumber: req.query.number,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.get('/StatsRecommendations',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Recommendations > Tracking accessed');

        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        var DataRecommendations = Recommendations.LoadAuditRecommendationsForAnalysis(NewAuditFile, req.session.lang);

        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'trackauditrecs',
            AuditErrors: '',
            data: DataRecommendations,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user:'',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

analyticsaudit.get('/AuditMap',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Overview > Audit Tree Map accessed');

        //var AuditMapFile = credentials.WorkSetPath;
        //AuditMapFile = AuditMapFile + 'test.map';
        //var DataAuditMap = AuditMap.LoadAuditMap(AuditMapFile);
        var DataAuditMap = AuditMap.GenerateAuditMap(NewAuditFile, req.session.lang);
        res.render('toolaudit/auditmap', {
            action: 'audit',
            operation: 'auditmap',
            AuditErrors: '',
            data: DataAuditMap, 
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            appAudit: appObjects.audit,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

module.exports = analyticsaudit;