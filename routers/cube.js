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

const neo4j = require('neo4j-driver');
const driver = neo4j.driver(credentials.neo4j.uri, neo4j.auth.basic(credentials.neo4j.user,credentials.neo4j.password));

var cube = express.Router();

cube.get('/kgraph', (req, res) => {
       req.session.lang = commonF.GetLang(req);

       var appObjects = appLang.GetData(req.session.lang);


       res.render('./cube/kgraph', {
              sessionlang: req.session.lang,
              nav: appObjects.pageNavigation
       });
});

cube.get('/aigraph', (req,res)=>{
       var CypherTableQuery='MATCH (a1:Audit)-[r1:COVER|PERFORM|IDENTIFIED]-(n1) WHERE '
       CypherTableQuery = CypherTableQuery + 'a1.URL="http://egov.nik.gov.pl/g/egov/CH/2017/BuildingProjects/alg_BuildingProjects.html" '
       CypherTableQuery = CypherTableQuery + 'OR a1.URL="http://egov.nik.gov.pl/g/egov/DE/2016/Bridges/alg_Bridges.html"'
       CypherTableQuery = CypherTableQuery + ' return a1, n1 ';
       CypherTableQuery = CypherTableQuery + ' union ';
       CypherTableQuery=  CypherTableQuery + 'MATCH (y1:Audit)-[r1:COVER|PERFORM|IDENTIFIED]-(a1)-[r2:RESULTING_IN]-(n1) WHERE '
       CypherTableQuery = CypherTableQuery + 'y1.URL="http://egov.nik.gov.pl/g/egov/CH/2017/BuildingProjects/alg_BuildingProjects.html" '
       CypherTableQuery = CypherTableQuery + 'OR y1.URL="http://egov.nik.gov.pl/g/egov/DE/2016/Bridges/alg_Bridges.html"'
       CypherTableQuery = CypherTableQuery + ' return a1, n1 ';
       console.log(CypherTableQuery)
       const session = driver.session();

       
       session
       .run(CypherTableQuery)
       .then(result => {
              var vGroup=0;
              var vLabel='';
              var nodesIds = [];
              var visNodes = [];
              var visEdges =  [];
              result.records.forEach(function(record){
                     switch (record._fields[0].labels[0]) {
                     case 'Audit':
                            vGroup=0;
                            vLabel=record._fields[0].labels[0];
                            break;
                     case 'Topics':
                            vGroup=1;
                            vLabel=record._fields[0].properties.Definition;
                            break;
                     case 'Risk_Case':
                            vGroup=2;
                            vLabel=record._fields[0].labels[0];
                            break;
                     case 'Function':
                            vGroup=3;
                            vLabel=record._fields[0].properties.Definition;
                            break;
                     default: //'Observation':
                            vGroup=4;
                            vLabel=record._fields[0].labels[0];
                     };
                     if (nodesIds.includes(record._fields[0].identity.low)== false)
                     {
                            var objAudit = {
                                   id: record._fields[0].identity.low,
                                   label: vLabel,
                                   title:record._fields[0].labels[0] + ": " + record._fields[0].properties.Title,
                                   group:vGroup
                            };
                            visNodes.push(objAudit);
                            nodesIds.push(record._fields[0].identity.low);
                     }
                     switch (record._fields[1].labels[0]) {
                     case 'Audit':
                            vGroup=0;
                            vLabel=record._fields[1].properties.Definition;
                            break;
                     case 'Topics':
                            vGroup=1;
                            vLabel=record._fields[1].properties.Definition;
                            break;
                     case 'Risk_Case':
                            vGroup=2;
                            vLabel=record._fields[1].labels[0];
                            break;
                     case 'Function':
                            vGroup=3;
                            vLabel=record._fields[1].properties.Definition;
                            break;
                     default:
                            vGroup=4;
                            vLabel=record._fields[1].labels[0];
                     };
                     if (nodesIds.includes(record._fields[1].identity.low)== false)
                     {
                            var objAudit = {
                                   id: record._fields[1].identity.low,
                                   label: vLabel,
                                   title:record._fields[1].labels[0] + ": " + record._fields[1].properties.Definition,
                                   group:vGroup
                            };
                            visNodes.push(objAudit);
                            nodesIds.push(record._fields[1].identity.low);
                     }
                     var objRelation = {
                            from: record._fields[0].identity.low,
                            to: record._fields[1].identity.low
                     };
                     visEdges.push(objRelation);
              });

              res.render('cube/aigraph', {
                     visEdges: visEdges,
                     visNodes: visNodes
              });
       })
});


module.exports = cube;
