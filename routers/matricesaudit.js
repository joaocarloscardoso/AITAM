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

var matricesaudit = express.Router();

matricesaudit.get('/planMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var PlanMatrix = Matrices.LoadPlanMatrix(NewAuditFile, req.query.plugin, req.query.domain, req.query.area, req.query.issue);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'plan_matrix',
            source: req.query.src,
            AuditErrors: '',
            Matrix: PlanMatrix,
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

matricesaudit.get('/findingMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'finding_matrix',
            source: req.query.src,
            AuditErrors: '',
            Matrix: FindingMatrix,
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

matricesaudit.get('/FindingData',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'finding_data',
            source: '',
            AuditErrors: '',
            Matrix: FindingMatrix,
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

matricesaudit.get('/recMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var RecommendationMatrix = Matrices.LoadRecommendationMatrix(NewAuditFile, req.query.id);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'audit_recommendations',
            source: req.query.src,
            AuditErrors: '',
            Matrix: RecommendationMatrix,
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

matricesaudit.get('/preassessMatrix',function(req,res){
    //res.send('Hello e-gov');
    //res.json(persons);
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

    if (status) {
        var preassessMatrix = Matrices.LoadPreAssessMatrix(NewAuditFile, req.query.area, req.query.issue);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'preassess_matrix',
            source: '',
            AuditErrors: '',
            Matrix: preassessMatrix,
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

matricesaudit.post('/preassessMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    
    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit matrix');
        } else {
            var AreaId = req.body['areaid'];
            var IssueId = req.body['issueid'];
            var totalCtrl = req.body.rows_count;
            var Catalog = [];
            var vType = '';
            for ( var i = 1; i <= totalCtrl; i++) {
                vType = '';
                var vRef = req.body['ref' + i.toString()];
                if (vRef.indexOf("|")== -1){
                    vType = 'Element';
                } else {
                    vType = 'IElement';
                }
                var ctrlType = req.body['el' + i.toString()];
                var NewEntry = {
                    Reference: vRef,
                    Type: vType,
                    Value: req.body[ctrlType + i.toString()]
                };
                Catalog.push(NewEntry);
            }
            var status = Matrices.SavePreAssessMatrix(NewAuditFile, Catalog, AreaId, IssueId);
            var preassessMatrix = Matrices.LoadPreAssessMatrix(NewAuditFile, AreaId, IssueId);
            //Issue #52: Automatic save/download on conclusion of key activities
            res.redirect('/toolaudit/work/download');
            //
            /*due to: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
            res.render('toolaudit/supportmatrix', {
                action: 'audit',
                operation: 'preassess_matrix',
                AuditErrors: '',
                Matrix: preassessMatrix,
                msg: '',
                auditfile: 'work/' + req.sessionID + '.xml',
                audit: status
            });*/
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

matricesaudit.post('/planMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    
    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit matrix');
        } else {
            var Catalog = {
                PluginId: req.body.plugin,
                DomainId: req.body.domain,
                AreaId: req.body.area,
                IssueId: req.body.issue,
                Objectives: req.body.objectives,
                Criteria: req.body.criteria,
                Inforequired: req.body.inforequired,
                Method: req.body.method,
                Found: req.body.foundpreviously,
                Conclusion: req.body.conclusion
            };
            //save plugins selected for audit
            var status = Matrices.SavePlanMatrix(NewAuditFile, Catalog);
            var PlanMatrix = Matrices.LoadPlanMatrix(NewAuditFile, Catalog.PluginId, Catalog.DomainId, Catalog.AreaId, Catalog.IssueId);
            //Issue #52: Automatic save/download on conclusion of key activities
            res.redirect('/toolaudit/work/download');
            //
            /*due to: Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
            res.render('toolaudit/supportmatrix', {
                action: 'audit',
                operation: 'plan_matrix',
                AuditErrors: '',
                Matrix: PlanMatrix,
                msg: '',
                auditfile: 'work/' + req.sessionID + '.xml',
                audit: status
            });*/
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

matricesaudit.post('/findingMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    
    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit matrix');
        } else {
            var vItems = req.body.issue.split("_");
            var Catalog = {
                FindingId: req.body.findingid,
                Source: req.body.source,
                Domain: vItems[1],
                Area: vItems[2],
                Issue: vItems[3],
                Cause: req.body.cause,
                Result: req.body.result,
                Description: req.body.description,
                Recommendation: req.body.recommendation,
                LegalAct: req.body.legalact,
                ReportReference: req.body.report
            };
            //save plugins selected for audit
            var RefId = Matrices.SaveFindingMatrix(NewAuditFile, Catalog);
            //Issue #52: Automatic save/download on conclusion of key activities
            if (req.body.findingid == '(New)'){
                if (RefId.substring(0, 1) == 'F') {
                    var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, RefId);
                    res.render('toolaudit/supportmatrix', {
                        action: 'audit',
                        operation: 'finding_matrix',
                        source: 'tbl',
                        AuditErrors: '',
                        Matrix: FindingMatrix,
                        msg: '',
                        auditfile: 'work/' + req.sessionID + '.xml',
                        audit: 'true'
                    });                    
                }
            }else{
                res.redirect('/toolaudit/work/download')
            }
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

matricesaudit.post('/recMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    
    if (status) {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit matrix');
        } else {
            var Catalog = {
                RecommendationId: req.body.recid,
                Priority: req.body.priority,
                Risk: req.body.risk,
                Riskevaluation: req.body.riskevaluation,
                Accepted: req.body.accepted,
                Repeated: req.body.reapeated,
                Importance: req.body.importance,
                Category: req.body.category,
                Description: req.body.description,
                Actionplan: req.body.actionplan,
                Responsible: req.body.responsible,
                Timeline: req.body.timeline,
                Outcome: req.body.outcome,
                Remarks: req.body.remarks,
                RelFindings: [],
                Monitoring:[]
            };
            var totalCtrl = req.body.frows_count; 
            for ( var i = 1; i <= totalCtrl; i ++) {
                var NewEntry = {
                    RowId: req.body['RF_' + i.toString()]
                };
                if (typeof NewEntry.RowId != 'undefined') {
                    Catalog.RelFindings.push(NewEntry);
                }
            }

            totalCtrl = req.body.mrows_count; 
            for ( var i = 1; i <= totalCtrl; i ++) {
                var NewEntry = {
                    RowId: i,
                    Date: req.body['MD_' + i.toString()],
                    Status: req.body['MS_' + i.toString()],
                    Note: req.body['MT_' + i.toString()]
                };
                if (typeof NewEntry.Date != 'undefined') {
                    Catalog.Monitoring.push(NewEntry);
                }
            }

            //save recommendations selected for audit
            var RefId = Matrices.SaveRecommendationMatrix(NewAuditFile, Catalog);
            //Issue #52: Automatic save/download on conclusion of key activities
            if (req.body.recid == '(New)'){
                if (RefId.substring(0, 1) == 'R') {
                    var RecommendationMatrix = Matrices.LoadRecommendationMatrix(NewAuditFile, RefId);
                    res.render('toolaudit/supportmatrix', {
                        action: 'audit',
                        operation: 'audit_recommendations',
                        source: 'tbl',
                        AuditErrors: '',
                        Matrix: RecommendationMatrix,
                        msg: '',
                        auditfile: 'work/' + req.sessionID + '.xml',
                        audit: status
                    });            
                }
            }else{
                res.redirect('/toolaudit/work/download')
            }
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


module.exports = matricesaudit;