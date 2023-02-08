//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('../credentials.js');
//audit recommendations catalogue
var AuditRecommendations = require('../lib/auditrec.js');
//logging system
var log = require('../lib/log.js');
//trace system
var trace = require('../lib/audittrace.js');
//multilanguage support
var appLang = require('../lib/language.js');
//common business functions
var commonF = require('../lib/common.js');
//multilanguage support
var appLang = require('../lib/language.js');

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

var auditrec = express.Router();

auditrec.get('/auditrecs',function(req,res){
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
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Recommendations > Recommendations Table accessed');

        var reccatalog = AuditRecommendations.LoadAuditRecommendations(NewAuditFile, req.session.lang);
        //var teste = Findings.FindingsForGeneralDomainsAnalysis(NewAuditFile);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_recommendations',
            AuditErrors: '',
            reccatalog: reccatalog,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit,
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


auditrec.get('/deleteauditrec/:auditrecId',function(req,res){
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
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 1, 'Recommendations > Recommendation deleted');

        var status = AuditRecommendations.DeleteAuditRecommendation(NewAuditFile, req.params.auditrecId);
        var reccatalog = AuditRecommendations.LoadAuditRecommendations(NewAuditFile, req.session.lang);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_recommendations',
            AuditErrors: '',
            reccatalog: reccatalog,
            msg: appObjects.messages.recommendation_deleted,
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.render('login/login', {
            action: 'login',
            auditfile: '',
            //persons: persons,
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

module.exports = auditrec;