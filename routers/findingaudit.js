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

//generation of uuid
const uuid = require('uuid/v4');
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

var findingaudit = express.Router();

findingaudit.get('/auditfindings',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var findingscatalog = Findings.LoadFindings(NewAuditFile);
        var teste = Findings.FindingsForGeneralDomainsAnalysis(NewAuditFile);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_findings',
            AuditErrors: '',
            findingcatalog: findingscatalog,
            msg: '',
            auditfile: 'work/' + req.sessionID + '.xml',
	        audit: status
         });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status
        });
    }
});

findingaudit.post('/auditfindings', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    
    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit findings');
        } else {
            var totalCtrl = req.body.rows_count;
            var Catalog = [];
            for ( var i = 1; i <= totalCtrl; i ++) {
                var NewEntry = {
                    Id: req.body['#' + i.toString() + 'Id'],
                    Selected: req.body['#' + i.toString() + 'Include']
                };
                Catalog.push(NewEntry);
            }
            //save plugins selected for audit
            var status = Findings.SaveFindings(NewAuditFile, Catalog);

            var findingscatalog = Findings.LoadFindings(NewAuditFile);
            res.render('toolaudit/toolwork', {
                action: 'audit',
                operation: 'audit_findings',
                AuditErrors: '',
                findingcatalog: findingscatalog,
                msg: 'Audit saved successfuly! Use "Download" command under "Audit" menu to get the file.',
                auditfile: 'work/' + req.sessionID + '.xml',
                audit: status
             });
        }
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status
        });
    }    
});

findingaudit.get('/deleteauditfinding/:findingId',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var status = Findings.DeleteFinding(NewAuditFile, req.params.findingId);
        var findingscatalog = Findings.LoadFindings(NewAuditFile);
        res.render('toolaudit/toolwork', {
            action: 'audit',
            operation: 'audit_findings',
            AuditErrors: '',
            findingcatalog: findingscatalog,
            msg: 'Selected finding deleted!',
            auditfile: 'work/' + req.sessionID + '.xml',
	        audit: status
         });
    } else {
        res.render('login/login', {
            action: 'login',
            auditfile: '',
            //persons: persons,
            audit: status
        });
    }
});

module.exports = findingaudit;