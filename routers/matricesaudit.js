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
//portfolios
var portfolio = require('../lib/portfolio.js');
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

var matricesaudit = express.Router();

matricesaudit.get('/planMatrix',function(req,res){
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
        var PlanMatrix = Matrices.LoadPlanMatrix(NewAuditFile, req.query.plugin, req.query.domain, req.query.area, req.query.issue, req.session.lang);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'plan_matrix',
            source: req.query.src,
            AuditErrors: '',
            Matrix: PlanMatrix,
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

matricesaudit.get('/findingMatrix',function(req,res){
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
        var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id, req.session.lang);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'finding_matrix',
            source: req.query.src,
            AuditErrors: '',
            Matrix: FindingMatrix,
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
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
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
        var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, req.query.id, req.session.lang);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'finding_data',
            source: '',
            AuditErrors: '',
            Matrix: FindingMatrix,
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
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
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
    //console.log(req.session.passport.user);

    if (status) {
        var RecommendationMatrix = Matrices.LoadRecommendationMatrix(NewAuditFile, req.query.id, req.session.lang);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'audit_recommendations',
            source: req.query.src,
            AuditErrors: '',
            Matrix: RecommendationMatrix,
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
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
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
        var preassessMatrix = Matrices.LoadPreAssessMatrix(NewAuditFile, req.query.area, req.query.issue, req.session.lang);
        res.render('toolaudit/supportmatrix', {
            action: 'audit',
            operation: 'preassess_matrix',
            source: '',
            AuditErrors: '',
            Matrix: preassessMatrix,
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
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }
});

matricesaudit.post('/preassessMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);
    var user = '';

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
            var status = Matrices.SavePreAssessMatrix(NewAuditFile, Catalog, AreaId, IssueId, req.session.lang);
            var preassessMatrix = Matrices.LoadPreAssessMatrix(NewAuditFile, AreaId, IssueId, req.session.lang);
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
            audit: status,
            rectracking: credentials.portfolio,
            user:'',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.post('/planMatrix', function(req, res){
    //old: path.join(__dirname,'work')
    var NewAuditFile = credentials.WorkSetPath;
    NewAuditFile = NewAuditFile + req.sessionID + '.xml';
    var InitialAudit = require('../lib/initialaudit.js')(NewAuditFile);
    var status = InitialAudit.VerifyAuditFile(NewAuditFile);

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
            var status = Matrices.SavePlanMatrix(NewAuditFile, Catalog, req.session.lang);
            var PlanMatrix = Matrices.LoadPlanMatrix(NewAuditFile, Catalog.PluginId, Catalog.DomainId, Catalog.AreaId, Catalog.IssueId, req.session.lang);
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
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.post('/findingMatrix', function(req, res){
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
                Number: req.body.number,
                Name: req.body.findname,
                Description: req.body.description,
                Recommendation: req.body.recommendation,
                LegalAct: req.body.legalact,
                ReportReference: req.body.report
            };
            //save plugins selected for audit
            var RefId = Matrices.SaveFindingMatrix(NewAuditFile, Catalog, req.session.lang);
            //Issue #52: Automatic save/download on conclusion of key activities
            if (req.body.findingid == '(New)'){
                if (RefId.substring(0, 1) == 'F') {
                    var FindingMatrix = Matrices.LoadFindingMatrix(NewAuditFile, RefId, req.session.lang);
                    res.render('toolaudit/supportmatrix', {
                        action: 'audit',
                        operation: 'finding_matrix',
                        source: 'tbl',
                        AuditErrors: '',
                        Matrix: FindingMatrix,
                        msg: '',
                        auditfile: 'work/' + req.sessionID + '.xml',
                        audit: 'true',
                        rectracking: credentials.portfolio,
                        user: user,
                        appButtons:  appObjects.buttons,
                        appAudit: appObjects.audit,
                        sessionlang: req.session.lang,
                        nav: appObjects.pageNavigation
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
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.post('/recMatrix', function(req, res){
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
                Category: req.body.category === '' ? '(Not defined yet)' : req.body.category,
                Description: req.body.description,
                Number: req.body.number,
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
            var RefId = Matrices.SaveRecommendationMatrix(NewAuditFile, Catalog, req.session.lang);
            //Issue #52: Automatic save/download on conclusion of key activities
            if (req.body.recid == '(New)'){
                if (RefId.substring(0, 1) == 'R') {
                    var RecommendationMatrix = Matrices.LoadRecommendationMatrix(NewAuditFile, RefId, req.session.lang);
                    res.render('toolaudit/supportmatrix', {
                        action: 'audit',
                        operation: 'audit_recommendations',
                        source: 'tbl',
                        AuditErrors: '',
                        Matrix: RecommendationMatrix,
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
            audit: status,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.get('/portfolio',function(req,res){
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
    //console.log('user:' + user);

    if (user != '') {
        if (req.query.id != 'New') {
            portfolio.LoadPortfolioOverview(req.query.id, req.session.lang).then(function(Result){
                res.render('toolaudit/supportmatrix', {
                    //action: req.query.action,
                    action: 'portfolio',
                    AuditErrors: '',
                    msg: '',
                    operation: 'portfolio',
                    catalog: Result,
                    user: user,
                    rectracking: credentials.portfolio,
                    audit: true,
                    sessionlang: req.session.lang,
                    nav: appObjects.pageNavigation
                });     
            });
        } else {
            var Catalog = portfolio.LoadNewPortfolioOverview();
            res.render('toolaudit/supportmatrix', {
                //action: req.query.action,
                action: 'portfolio',
                AuditErrors: '',
                msg: '',
                operation: 'portfolio',
                catalog: Catalog,
                user: user,
                rectracking: credentials.portfolio,
                audit: true,
                sessionlang: req.session.lang,
                nav: appObjects.pageNavigation
            });     
        }
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

matricesaudit.post('/portfolio', function(req, res){
    //old: path.join(__dirname,'work')
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

    if (user != '') {
        //check if req.body is filled
        if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
            log.warn('Object req.body missing on tool audit matrix');
        } else {
            var Catalog = {
                portfolioid: req.body.portfolioid,
                description: req.body.description,
                coverage: req.body.coverage,
                org: req.body.sai,
                publish: req.body.published === 'Yes' ? '1' : '0'
            };

            if (req.body.action == 'update') {
                if (req.body.portid == 'New') {
                    portfolio.CreatePortfolio(Catalog, user).then(function(Result){
                        var NewPortId = Result;
                        portfolio.LoadPortfolioOverview(NewPortId, req.session.lang).then(function(Result){
                            res.render('toolaudit/supportmatrix', {
                                //action: req.query.action,
                                action: 'portfolio',
                                AuditErrors: '',
                                msg: 'Portfolio created!',
                                operation: 'portfolio',
                                catalog: Result,
                                rectracking: credentials.portfolio,
                                user: user,
                                audit: true,
                                sessionlang: req.session.lang,
                                nav: appObjects.pageNavigation
                            });     
                        });
                    });
                }else{
                    portfolio.UpdatePortfolio(req.body.portid, Catalog, user).then(function(Result){
                        portfolio.LoadPortfolioOverview(req.body.portid, req.session.lang).then(function(Result){
                            res.render('toolaudit/supportmatrix', {
                                //action: req.query.action,
                                action: 'portfolio',
                                AuditErrors: '',
                                msg: 'Portfolio updated!',
                                operation: 'portfolio',
                                catalog: Result,
                                rectracking: credentials.portfolio,
                                user: user,
                                audit: true,
                                sessionlang: req.session.lang,
                                nav: appObjects.pageNavigation
                            });     
                        });    
                    });
                };
            } else if (req.body.action == 'delaudit') {
                portfolio.DeleteAuditFromPortfolio(req.body.portid, req.body.auditid, user).then(function(Result){
                    portfolio.LoadPortfolioOverview(req.body.portid, req.session.lang).then(function(Result){
                        res.render('toolaudit/supportmatrix', {
                            //action: req.query.action,
                            action: 'portfolio',
                            AuditErrors: '',
                            msg: '',
                            operation: 'portfolio',
                            catalog: Result,
                            rectracking: credentials.portfolio,
                            user: user,
                            audit: true,
                            sessionlang: req.session.lang,
                            nav: appObjects.pageNavigation
                        });     
                    });    
                });
            };
        }
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            rectracking: credentials.portfolio,
            audit: true,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.get('/portfoliodetach', function(req, res){
    //old: path.join(__dirname,'work')
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

    if (user != '') {
        portfolio.DeleteAuditFromPortfolio(req.query.id, req.query.auditid, user).then(function(Result){
            portfolio.LoadPortfolioOverview(req.query.id, req.session.lang).then(function(Result){
                res.render('toolaudit/supportmatrix', {
                    //action: req.query.action,
                    action: 'portfolio',
                    AuditErrors: '',
                    msg: 'Selected audit was successfully dettached!',
                    operation: 'portfolio',
                    catalog: Result,
                    rectracking: credentials.portfolio,
                    user: user,
                    audit: true,
                    sessionlang: req.session.lang,
                    nav: appObjects.pageNavigation
                });     
            });    
        });
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: true,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.get('/portfolioattach', function(req, res){
    //old: path.join(__dirname,'work')
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

    if (user != '') {
        portfolio.ListPortfolioBasic(req.query.id).then(function(Result){
            res.render('portal/portfolioattach', {
                //action: req.query.action,
                action: 'attachaudit',
                catalog: Result,
                user: user,
                rectracking: credentials.portfolio,
                audit: true,
                sessionlang: req.session.lang,
                nav: appObjects.pageNavigation
            });     
        });    
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: true,
            rectracking: credentials.portfolio,
            user: '',
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

matricesaudit.post('/toolAttachaudit', function(req, res){    
    var form = new formidable.IncomingForm();
    form.uploadDir = credentials.WorkSetPath;

    form.on('fileBegin', function(field, file) {
        //rename the incoming file to the file's name
        file.path = form.uploadDir + 'port_' + req.sessionID + '.xml';
    });   

    form.parse(req, function(err, fields, files){
        var AuditFile = credentials.WorkSetPath;
        AuditFile = AuditFile + 'port_' + req.sessionID + '.xml';
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
                auditfile: 'work/' + 'port_' + req.sessionID + '.xml',
                audit: status,
                rectracking: credentials.portfolio,
                user: user,
                sessionlang: req.session.lang,
                nav: appObjects.pageNavigation
            });
        }
        log.info(`User (` +  req.session.passport.user + `) uploaded a file: ${JSON.stringify(files)}`);
        //res.redirect(303, '/thank-you');
        //var CheckedAuditFile = credentials.WorkSetPath;
        //CheckedAuditFile = CheckedAuditFile + req.sessionID + '.xml';

        portfolio.AddAuditToPortfolio(fields.portfolioid, AuditFile, user).then(function(Result){
            if (Result.length > 1 && Result[0].hasOwnProperty('msg')){
                var ErrorsInPortfolio = Result;
                portfolio.LoadPortfolioOverview(fields.portfolioid, req.session.lang).then(function(Result){
                    return  res.render('toolaudit/supportmatrix', {
                        //action: req.query.action,
                        action: 'portfolio',
                        AuditErrors: ErrorsInPortfolio,
                        msg: '',
                        operation: 'portfolio',
                        catalog: Result,
                        user: user,
                        rectracking: credentials.portfolio,
                        audit: true,
                        sessionlang: req.session.lang,
                        nav: appObjects.pageNavigation
                    });     
                });    
            } else {
                portfolio.LoadPortfolioOverview(fields.portfolioid, req.session.lang).then(function(Result){
                    return  res.render('toolaudit/supportmatrix', {
                        //action: req.query.action,
                        action: 'portfolio',
                        AuditErrors: '',
                        msg: 'Selected audit was attached to portfolio!',
                        operation: 'portfolio',
                        catalog: Result,
                        user: user,
                        rectracking: credentials.portfolio,
                        audit: true,
                        sessionlang: req.session.lang,
                        nav: appObjects.pageNavigation
                    });     
                });    
            };
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


module.exports = matricesaudit;