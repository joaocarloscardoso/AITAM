//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('../credentials.js');
//plugins stats and catalogue
var Matrices = require('../lib/matrices.js');
var Docs = require('../lib/docgeneration.js');
var Planning = require('../lib/planning.js');
var Recommendations = require('../lib/auditrec.js');
var Excel = require('../lib/excel.js');
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
//report generation template engine
const carbone = require('carbone');

var generatedocs = express.Router();

generatedocs.get('/docplanMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.' + credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadPlanMatrix(NewAuditFile, req.query.plugin, req.query.domain, req.query.area, req.query.issue, req.session.lang);
        carbone.render('./public/templates/PlanMatrix.' + credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (plan matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.' + credentials.ReportFormat);
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

generatedocs.get('/docpreassessMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadPreAssessMatrix(NewAuditFile, req.query.area, req.query.issue, req.session.lang);
        carbone.render('./public/templates/PreAssessMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (preassessment matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docfindingMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id, req.session.lang);
        carbone.render('./public/templates/FindingMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (finding matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docrecMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadRecommendationMatrix(NewAuditFile, req.query.id, req.session.lang);
        carbone.render('./public/templates/RecMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (recommendation matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docauditprogramme',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadAuditProgramme(NewAuditFile, req.session.lang);
        carbone.render('./public/templates/AuditProgramme.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Audit Programme) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docexecutivesummary',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadExecutiveSummary(NewAuditFile, req.session.lang);
        carbone.render('./public/templates/AuditExecutiveSummary.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Executive Summary) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docplanList',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.' + credentials.ReportFormat;

    if (status) {
        var data = Planning.LoadPlanning2Doc(NewAuditFile, req.query.op, req.session.lang);
        carbone.render('./public/templates/PlanList.' + credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (plan list) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.' + credentials.ReportFormat);
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

generatedocs.get('/docmatriceslist',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadMatricesCollection(NewAuditFile, req.session.lang);
        carbone.render('./public/templates/PlanMatrixCollection.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Collection of Planning Matrices) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/rectrackreport',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Recommendations.LoadAuditRecommendationsForAnalysis(NewAuditFile, req.session.lang);
        carbone.render('./public/templates/RecTrackReport.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (recommendations tracking report) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docexecutivesummarywrecs',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadExecutiveSummaryWRecs(NewAuditFile, req.session.lang);
        carbone.render('./public/templates/AuditExecutiveSummaryWRecs.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Executive Summary with recommendations) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
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

generatedocs.get('/docmethodmatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.xlsx';

    if (status) {
        var data = Docs.LoadAuditProgramme(NewAuditFile, req.session.lang);
        var workbook = Excel.GenerateMethologicalMatrix(data);
        workbook.xlsx.writeFile(NewDocFile)
            .then(function() {
            // 
            res.redirect('/document/work/' + req.sessionID + '.xlsx');
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

generatedocs.get('/heatmatrix',function(req,res){
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

    if (status) {
        var heatdata = Docs.LoadPlanHeatMatrix(NewAuditFile, req.session.lang);
        res.render('toolaudit/heatmatrix', {
            action: 'heatmatrix',
            operation: 'audit_plan_heatmatrix',
            AuditErrors: '',
            plancatalog: heatdata,
            msg: '',
            auditfile: '',
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

module.exports = generatedocs;