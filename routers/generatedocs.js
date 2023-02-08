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
//trace system
var trace = require('../lib/audittrace.js');
var appLang = require('../lib/language.js');
//common business functions
var commonF = require('../lib/common.js');
var FileAuditID = require('../lib/planning.js');

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

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_planmatrix_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadPlanMatrix(NewAuditFile, req.query.plugin, req.query.domain, req.query.area, req.query.issue, req.session.lang);

        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (plan matrix) generated');

        carbone.render('./public/templates/PlanMatrix.' + credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (plan matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.' + credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);

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

generatedocs.get('/docpreassessMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_preassessmatrix_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadPreAssessMatrix(NewAuditFile, req.query.area, req.query.issue, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (preassessment matrix) generation');

        carbone.render('./public/templates/PreAssessMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (preassessment matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docfindingMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_findingmatrix_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (finding matrix) generation');

        carbone.render('./public/templates/FindingMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (finding matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docrecMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_recommendationmatrix_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Matrices.LoadRecommendationMatrix(NewAuditFile, req.query.id, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (recommendation matrix) generation');

        carbone.render('./public/templates/RecMatrix.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (recommendation matrix) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docauditprogramme',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_programme_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadAuditProgramme(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Audit Programme) generation');

        carbone.render('./public/templates/AuditProgramme.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Audit Programme) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docexecutivesummary',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_executivesummary_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadExecutiveSummary(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Executive Summary) generation');

        carbone.render('./public/templates/AuditExecutiveSummary.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Executive Summary) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docplanList',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.' + credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_planlist_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Planning.LoadPlanning2Doc(NewAuditFile, req.query.op, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (plan list) generation');

        carbone.render('./public/templates/PlanList.' + credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (plan list) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);            
            //res.redirect('/document/work/' + req.sessionID + '.' + credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docmatriceslist',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_planmatriceslist_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadMatricesCollection(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Collection of Planning Matrices) generation');

        carbone.render('./public/templates/PlanMatrixCollection.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Collection of Planning Matrices) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/rectrackreport',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_rectrackingreport_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Recommendations.LoadAuditRecommendationsForAnalysis(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (recommendations tracking report) generation');

        carbone.render('./public/templates/RecTrackReport.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (recommendations tracking report) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docexecutivesummarywrecs',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.'+ credentials.ReportFormat;

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_executivesummarywrecs_' + req.session.lang.toUpperCase().substring(0, 2)+ '.' + credentials.ReportFormat;

    if (status) {
        var data = Docs.LoadExecutiveSummaryWRecs(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Executive Summary with recommendations) generation');

        carbone.render('./public/templates/AuditExecutiveSummaryWRecs.'+ credentials.ReportFormat, data, function(err, result){
            if (err) {
                return log.info('document (Executive Summary with recommendations) generation error:  ' +err);
            }
            // write the result
            fs.writeFileSync(NewDocFile, result);
            //res.redirect('/document/work/' + req.sessionID + '.'+ credentials.ReportFormat);
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/docmethodmatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.xlsx';

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(NewAuditFile);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_methodmatrix_' + req.session.lang.toUpperCase().substring(0, 2)+ '.xlsx';

    if (status) {
        var data = Docs.LoadAuditProgramme(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Method Matrix) generation');

        var workbook = Excel.GenerateMethologicalMatrix(data);
        workbook.xlsx.writeFile(NewDocFile)
            .then(function() {
            // 
            //res.redirect('/document/work/' + req.sessionID + '.xlsx');
            var fileOut = NewDocFile;
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/heatmatrix',function(req,res){
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
        var heatdata = Docs.LoadPlanHeatMatrix(NewAuditFile, req.session.lang);
        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (Heat Matrix) generation');

        res.render('toolaudit/heatmatrix', {
            action: 'heatmatrix',
            operation: 'audit_plan_heatmatrix',
            AuditErrors: '',
            plancatalog: heatdata,
            msg: '',
            auditfile: '',
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

generatedocs.get('/analyticalrawdata',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var file = credentials.WorkSetPath + req.sessionID + '.xml'
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.xlsx';

    req.session.lang = commonF.GetLang(req); 

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        var newFileName = FileAuditID.GetAuditID(file);
        if (newFileName == '') {
            newFileName  = req.sessionID;
        }
        newFileName  = newFileName + '_AnalyticalData_' + req.session.lang.toUpperCase().substring(0, 2)+'.xlsx';

        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (analytical raw data) generation');

        var workbook = Excel.GenerateRawData(NewAuditFile, req.session.lang);
        workbook.xlsx.writeFile(NewDocFile)
            .then(function() {
            // 
            //res.redirect('/document/work/' + req.sessionID + '.xlsx');
            var fileOut = credentials.WorkSetPath + req.sessionID + '.xlsx';
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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

generatedocs.get('/proceduredata',function(req,res){ 
    //res.send('Hello e-gov');
    //res.json(persons);
    var file = credentials.WorkSetPath + req.sessionID + '.xml'
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    var NewDocFile = credentials.WorkSetPath;
    NewDocFile = NewDocFile + req.sessionID + '.xlsx';

    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        var newFileName = FileAuditID.GetAuditID(file);
        if (newFileName == '') {
            newFileName  = req.sessionID;
        }
        newFileName  = newFileName + '_Procedures_' + req.session.lang.toUpperCase().substring(0, 2) + '.xlsx';

        trace.AddActivity(credentials.WorkSetPath + req.sessionID + '_trace.txt', req.sessionID, NewAuditFile, 0, 'Document (procedures) generation');

        var workbook = Excel.GenerateProcedureData(NewAuditFile, req.session.lang);
        workbook.xlsx.writeFile(NewDocFile)
            .then(function() {
            // 
            //res.redirect('/document/work/' + req.sessionID + '.xlsx');
            var fileOut = credentials.WorkSetPath + req.sessionID + '.xlsx';
            fileOut=fileOut.replace("/","\\");
            res.download(fileOut, newFileName);
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
module.exports = generatedocs;