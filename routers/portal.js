//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('../credentials.js');
//email system
var emailService = require('../lib/email.js')(credentials);
//plugins stats and catalogue
var pluginsService = require('../lib/catplugins.js')(credentials.PlugInsPath);
//logging system
var log = require('../lib/log.js');
//portfolios
var portfolio = require('../lib/portfolio.js');
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


var portal = express.Router();

portal.get('/tool', (req, res) => {
    //console.log('Inside GET /authrequired callback');
    //console.log(`User authenticated? ${req.isAuthenticated()}`);
    if(req.isAuthenticated()) {
        //console.log('userid2file1: ' + req.session.passport.user);
        //console.log('sessionid2file2: ' + req.sessionID);
        res.redirect('/portal/toolindex');
    } else {
        res.redirect('/login/login');
    }
});

portal.get('/toolindex', (req, res) => {
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);


    //console.log('Inside GET /authrequired callback');
    //console.log(`User authenticated? ${req.isAuthenticated()}`);
    if(req.isAuthenticated()) {
        res.render('portal/toolindex', {
            action: 'tool',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.redirect('/login/login');
    }
});  

portal.get('/contactfeedback',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);


    //res.send('Hello e-gov');
    //res.json(persons);
    console.log('work/' + req.sessionID + '.xml');
    res.render('portal/contactfeedback', {
        action: 'home',
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });
});

portal.get('/project',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);


    res.render('./portal/project', {
        //action: req.query.action,
        action: req.params.name,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});

portal.get('/desktop',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    res.render('portal/desktop', {
        //action: req.query.action,
        action: req.params.name,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});

portal.get('/newsdesktopv2',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    res.render('portal/newsdesktopv2', {
        //action: req.query.action,
        action: req.params.name,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});

portal.get('/language',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);
    var LastDate = '';
    var coreVersion= new Date().getFullYear().toString();
    var supportedLanguages= '';

    if (status)
    {
        coreVersion= InitialAudit.GetCoreVersion(AuditFile).substring(0, 4);
        supportedLanguages = InitialAudit.GetCoreSupportedLanguages(AuditFile);
    }

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (Number(coreVersion) < 2021) {
        var LangCatalog = [{ code: 'eng', name: 'English' }];
        var supportedLanguages='eng';
    } else {
        var LangCatalog = appLang.GetWorkingLanguages(supportedLanguages);
    }

    //console.log(PluginsCatalog.length)
    res.render('portal/language', {
        //action: req.query.action,
        action: req.params.name,
        lastupdate: LastDate,
        catalog: LangCatalog,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});

portal.post('/language',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);
    var LastDate = ''
    var coreVersion= new Date().getFullYear().toString()
    var supportedLanguages= '';

    if (status)
    {
        coreVersion= InitialAudit.GetCoreVersion(AuditFile).substring(0, 4);
        supportedLanguages = InitialAudit.GetCoreSupportedLanguages(AuditFile);
    }

    var user = commonF.GetUser(req);

    //set chosen working language
    try {
        req.session.lang=req.body['langSelected'];
    } catch (error) {
        req.session.lang=credentials.WorkLang;
    };

    var appObjects = appLang.GetData(req.session.lang);

    if (Number(coreVersion) < 2021) {
        var LangCatalog = [{ code: 'eng', name: 'English' }];
        var supportedLanguages='eng';
    } else {
        var LangCatalog = appLang.GetWorkingLanguages(supportedLanguages);
    }

    //console.log(PluginsCatalog.length)
    res.render('portal/language', {
        //action: req.query.action,
        action: req.params.name,
        lastupdate: LastDate,
        catalog: LangCatalog,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});


portal.get('/catalogplugins',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var LastDate = pluginsService.getMostRecentFileName();
    var PluginsCatalog = pluginsService.getListOfPlugins(req.session.lang);
    var AuditTemplatesCatalog = pluginsService.getListOfAuditTemplates(credentials.AuditTemplatesPath, req.session.lang);
    //console.log(PluginsCatalog.length)
    res.render('portal/catalogplugins', {
        //action: req.query.action,
        action: req.params.name,
        lastupdate: LastDate,
        catalog: PluginsCatalog,
        audittemplates: AuditTemplatesCatalog,
        downloadurl: credentials.urlpaths.plugins,
        downloadurlTemplates: credentials.urlpaths.audittemplates,
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
    });  
});

portal.get('/rectracking',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);
    var LastDate = ''

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    //console.log(PluginsCatalog.length)
    portfolio.ListPortfolios(user, '1').then(function(Result){
        if (Result.length > 0) {
            LastDate = Result[0].datepub.replace(/T/, ' ').replace(/\.\w*/, '');
        };
        res.render('portal/rectracking', {
            //action: req.query.action,
            action: req.params.name,
            lastupdate: LastDate,
            catalog: Result,
            user: user,
            rectracking: credentials.portfolio,
            audit: status,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });  
    });
});

portal.get('/recmanagement',function(req,res){
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);
    var LastDate = ''

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    //console.log(PluginsCatalog.length)
    portfolio.ListPortfoliosFromUser(user).then(function(Result){
        res.render('portal/recmanagement', {
            //action: req.query.action,
            action: req.params.name,
            lastupdate: LastDate,
            catalog: Result,
            user: user,
            rectracking: credentials.portfolio,
            audit: status,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });  
    });
});


portal.post('/contactus', [
    // email must be an email
        check('email').isEmail().withMessage('Invalid email!'),
        // first and last names must be at least 3 chars long
        check('name').isLength({ min: 3 }).withMessage('Name must be at least 3 chars long!'),
        check('message').isLength({ min: 3 }).withMessage('Message must be at least 3 chars long!')
    ], (req, res) => {
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    // Get content
    var newMessage = {
        name: req.body.name,
        message: req.body.message,
        email: req.body.email
    };
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        res.render('/index', {
            action: '#contact',
            message: newMessage,
            errors: errors.array(),
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
    else {
        res.render('templates/mailcontact', 
            { layout: null, message: newMessage }, function(err,html){
                if( err ) console.log('error in email template');

                emailService.send(credentials.AITAMmail,
                    'Information request from AITAM website',
                    html);
            }
        );        
        res.redirect(303,'contactfeedback')
        //console.log(newMessage);
    }
});

module.exports = portal;