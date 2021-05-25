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


var login = express.Router();

// create the login get and post routes  
login.get('/login',function(req,res){
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
    
    res.render('login/login', {
        action: 'login',
        auditfile: '',
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang
    });
});

login.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        log.info(`req.user: ${JSON.stringify(req.user)}`);
        if(info) {return res.send(info.message)}
        if (err) { return next(err); }
        if (!user) { return res.redirect('login/login'); }
        req.login(user, (err) => {
            if (err) { return next(err); }
            log.info(`Session id started: ${JSON.stringify(req.session.passport)}`);
            log.info(`User logged in: ${JSON.stringify(req.user)}`);
            return res.redirect('/portal/tool');
        })
    })(req, res, next);
});

module.exports = login;