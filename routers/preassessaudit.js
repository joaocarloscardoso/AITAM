//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('../credentials.js');
//plugins stats and catalogue
var PreAssessment = require('../lib/preassessment.js');
//logging system
var log = require('../lib/log.js');

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

var preassessaudit = express.Router();

preassessaudit.get('/auditpreassessment',function(req,res){
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
        var preassesscatalog = PreAssessment.LoadPreAssessment(NewAuditFile);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_preassess',
            AuditErrors: '',
            preassesscatalog: preassesscatalog,
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
            audit: status,
            rectracking: credentials.portfolio,
            user: ''
        });
    }
});

module.exports = preassessaudit;