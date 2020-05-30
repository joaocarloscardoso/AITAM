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

var analyticsportfolio = express.Router();

analyticsportfolio.get('/portfolio',function(req,res){
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
    res.type('text/html');
    res.status(500);
    res.render('500');
});

module.exports = analyticsportfolio;
