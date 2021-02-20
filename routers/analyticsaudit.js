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
//nlp
var nlp = require('../lib/nlp.js');
//nlp
var Recommendations = require('../lib/auditrec.js');
//audit maps
var AuditMap = require('../lib/auditmap.js');

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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var GeneralDomainCatalog = Findings.FindingsForGeneralDomainsAnalysis(NewAuditFile);
        var Domain01Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '01');
        //console.log('d01');
        var Domain02Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '02');
        //console.log('d02');
        var Domain03Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '03');
        //console.log('d03');
        var Domain04Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '04');
        //console.log('d04');
        var Domain05Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '05');
        //console.log('d05');
        var Domain06Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '06');
        //console.log('d06');
        var Domain07Catalog = Findings.FindingsForSpecificDomainsAnalysis(NewAuditFile, '07');
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
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            rectracking: credentials.portfolio,
            audit: status
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var CrawlerFile = credentials.WorkSetPath;
        CrawlerFile = CrawlerFile + req.sessionID + '.src';
        var TokenizerFile = credentials.WorkSetPath;
        TokenizerFile = TokenizerFile + req.sessionID + '.tkn';
        var VectorFile = credentials.WorkSetPath;
        VectorFile = VectorFile + req.sessionID + '.vec';

        var vFile = nlp.LoadCrawler(NewAuditFile, CrawlerFile);
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
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: ''
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var VectorFile = credentials.WorkSetPath;
        VectorFile = VectorFile + req.sessionID + '.vec';
        //var CypherQuery = nlp.GetCypherQuery(VectorFile);
        var CypherTableQuery = nlp.GetTableQuery(VectorFile);

        const session = driver.session();

        session
            .run(CypherTableQuery)
            .then(result => {
                var NodeResults = [];
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
                    //}
                });
                //console.log(NodeResults.sort(nlp.sort_by('Number', true, parseFloat)));
                var CypherQuery = nlp.GetCypherQuery(VectorFile);
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
                    user: user
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
            user: user
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        Vector = nlp.NLPSentimentFindings(NewAuditFile, SentimentFile);
        
        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'sentimentfindings',
            AuditErrors: '',
            Matrix: Vector,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user:''
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        Vector = nlp.NLPSentimentFindingsDetailed(SentimentFile, req.query.id);
        
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
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: ''
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        var SentimentFile = credentials.WorkSetPath;
        SentimentFile = SentimentFile + req.sessionID + '.sent';
        var DataRecommendations = Recommendations.LoadAuditRecommendationsForAnalysis(NewAuditFile);

        res.render('toolaudit/supportanalytics', {
            action: 'audit',
            operation: 'trackauditrecs',
            AuditErrors: '',
            data: DataRecommendations,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user:''
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
    var user = '';
    try {
        user = req.session.passport.user;
    } catch (error) {
        user ='';
    };

    try {
        if (req.session.lang === "" || typeof req.session.lang === 'undefined'){
            req.session.lang=credentials.WorkLang;
        };
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    if (status) {
        //var AuditMapFile = credentials.WorkSetPath;
        //AuditMapFile = AuditMapFile + 'test.map';
        //var DataAuditMap = AuditMap.LoadAuditMap(AuditMapFile);
        var DataAuditMap = AuditMap.GenerateAuditMap(NewAuditFile);
        res.render('toolaudit/auditmap', {
            action: 'audit',
            operation: 'auditmap',
            AuditErrors: '',
            data: DataAuditMap,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: user
        });
    }
});

module.exports = analyticsaudit;