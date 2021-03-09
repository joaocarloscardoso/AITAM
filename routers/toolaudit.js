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
// statistics service
var statisticsService = require('../lib/statistics.js');
//logging system
var log = require('../lib/log.js');
//multilanguage support
var appLang = require('../lib/language.js');
//common utilities
var common = require('../lib/common.js');

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

var tooleaudit = express.Router();

tooleaudit.get('/toolauditreference',function(req,res){
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

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        var AuditReference = InitialAudit.GetAuditReference(NewAuditFile, req.session.lang);
        //console.log(AuditReference);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_reference',
            source: req.query.src,
            AuditReference: AuditReference,
            AuditErrors: '',
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit
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

tooleaudit.get('/toolauditplugins',function(req,res){
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

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        var PluginsCatalog = pluginsService.getPluginsForAudit(NewAuditFile, req.session.lang);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_plugins',
            AuditErrors: '',
            catalog: PluginsCatalog,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit
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

tooleaudit.get('/auditstatistics',function(req,res){
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

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        var GeneralDomainCatalog = statisticsService.GeneralDomainCharacterization(NewAuditFile, req.session.lang);
        var GeneralRiskCatalog = statisticsService.GeneralRiskCharacterization(NewAuditFile, req.session.lang);
        var Domain01Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '01', req.session.lang);
        var Domain02Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '02', req.session.lang);
        var Domain03Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '03', req.session.lang);
        var Domain04Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '04', req.session.lang);
        var Domain05Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '05', req.session.lang);
        var Domain06Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '06', req.session.lang);
        var Domain07Catalog = statisticsService.SpecificDomainCharacterization(NewAuditFile, '07', req.session.lang);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_stats',
            AuditErrors: '',
            GeneralDomainCatalog: GeneralDomainCatalog,
            GeneralRiskCatalog: GeneralRiskCatalog,
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
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit
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

tooleaudit.post('/tooleditaudit', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = credentials.WorkSetPath;
    
    form.on('fileBegin', function(field, file) {
        //rename the incoming file to the file's name
        file.path = form.uploadDir + req.sessionID + '.xml';
    });   

    form.parse(req, function(err, fields, files){
        var AuditFile = credentials.WorkSetPath;
        AuditFile = AuditFile + req.sessionID + '.xml';
        var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
        var status = InitialAudit.VerifyAuditFile(AuditFile);
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
            
        var appObjects = appLang.GetData(req.session.lang);

        if(err) { 
            log.warn('Error loading file from user ' + req.session.passport.user +'!');
            return res.render('/portal/toolindex', {
                action: 'tool',
                auditfile: 'work/' + req.sessionID + '.xml',
                audit: status,
                rectracking: credentials.portfolio,
                user: user
            });
        }
        log.info(`User (` +  req.session.passport.user + `) uploaded a file: ${JSON.stringify(files)}`);
        //res.redirect(303, '/thank-you');
        //var CheckedAuditFile = credentials.WorkSetPath;
        //CheckedAuditFile = CheckedAuditFile + req.sessionID + '.xml';

        return res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_creation',
            msg: 'Load completed successfuly!',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit
        });
    });
    /*
    form.on('error', function(err) {
        console.log("an error has occured with form upload");
        console.log(err);
        request.resume();
    });
    form.on('aborted', function(err) {
        console.log("user aborted upload");
    });
    */
});  

tooleaudit.post('/toolnewaudit', function(req, res){
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
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

    var appObjects = appLang.GetData(req.session.lang);

    //Create new audit file
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    InitialAudit.CreateInitialAuditXML();
    //res.redirect(303, '/thank-you');
    return res.render('toolaudit/toolwork', {
        action: 'audit',
        operation: 'audit_creation',
        msg: 'New audit created successfuly!',
        auditfile: 'work/' + req.sessionID + '.xml',
        audit: true,
        rectracking: credentials.portfolio,
        user: user,
        appButtons:  appObjects.buttons,
        appAudit: appObjects.audit
    });
});  

tooleaudit.post('/toolauditreference', [
    check('auditid').isLength({ min: 2 }).withMessage('Audit ID must be at least 2 chars long!'),
    check('title').isLength({ min: 3 }).withMessage('Audit Title must be at least 3 chars long!')
], (req, res) => {
    // Get content
    var AuditReference = {
        AuditId: req.body.auditid,
        Title: req.body.title,
        Background: req.body.background,
        Scope: req.body.scope
    };

    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
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

    var appObjects = appLang.GetData(req.session.lang);

    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //return res.status(422).json({ errors: errors.array() });
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_reference',
            AuditReference: AuditReference,
            source: 'tbl',
            AuditErrors: errors.array(),
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: true,
            rectracking: credentials.portfolio,
            user: user,
            appButtons:  appObjects.buttons,
            appAudit: appObjects.audit
        });
    }
    else {
        //Save reference on audit file
        var InitialAudit = require('../lib/initialaudit.js')(AuditFile);
        InitialAudit.SetAuditReference(AuditFile, AuditReference, req.session.lang)
        //Issue #52: Automatic save/download on conclusion of key activities
        res.redirect('/toolaudit/work/download');
        //
        /*due to: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_reference',
            AuditReference: AuditReference,
            AuditErrors: '',
            msg: 'Audit saved successfuly! Use "Download" command under "Audit" menu to get the file.',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: true
        });*/
    }
});

tooleaudit.post('/toolauditplugins', function(req, res){
    //old: path.join(__dirname,'work')
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

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit plugins');
        } else {
            var totalCtrl = req.body.rows_count;
            var PlugIns2Audit = '';
            for ( var i = 1; i <= totalCtrl; i ++) {
                if (req.body['#' + i.toString() + 'Include'] == 'Yes'){
                    PlugIns2Audit = PlugIns2Audit + req.body['#' + i.toString() + 'Reference'] + '|' + req.body['#' + i.toString() + 'File'] + '#'
                }
            }
            //save plugins selected for audit
            var status = pluginsService.setPluginsForAudit(PlugIns2Audit, NewAuditFile);

            //reload plugins list and present save status
            var PluginsCatalog = pluginsService.getPluginsForAudit(NewAuditFile, req.session.lang);
            res.render('toolaudit/toolwork', {
                action: 'audit',
                operation: 'audit_plugins',
                AuditErrors: '',
                catalog: PluginsCatalog,
                msg: 'Audit saved successfuly! Use "Download" command under "Audit" menu to get the file.',
                auditfile: 'work/' + req.sessionID + '.xml',
                audit: status,
                rectracking: credentials.portfolio,
                user: user,
                appButtons:  appObjects.buttons,
                appAudit: appObjects.audit
            });
        }
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

module.exports = tooleaudit;
