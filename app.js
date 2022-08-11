//npm modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
//middleware to validate user controls
//deprecated: const { check, validationResult } = require('express-validator/check');
const { check, validationResult } = require('express-validator');
//credentials used in the app
var credentials = require('./credentials.js');
//email system
var emailService = require('./lib/email.js')(credentials);
//plugins stats and catalogue
var pluginsService = require('./lib/catplugins.js')(credentials.PlugInsPath);
//logging system
var log = require('./lib/log.js');
//multilanguage support
var appLang = require('./lib/language.js');
//common business functions
var commonF = require('./lib/common.js');
//generation of uuid
//old method bellow deprecated: https://github.com/uuidjs/uuid#deep-requires-now-deprecated
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
//garbage collector / file cleaner
var FileCleaner = require('cron-file-cleaner').FileCleaner;

const httpPort  = 3001;
const httpsPort = 3000;

const https = require('https');

//graphdb access
var graphdb = require('./lib/graphdb.js');
//issue #110 retain audit id to form downloaded xml file
var FileAuditID = require('./lib/planning.js');

var fileWatcher = new FileCleaner(credentials.WorkSetPath, (48 * 3600000),  '* */15 * * * *', {
    start: true
});

fileWatcher.on('start', function(info){
    log.info('garbage collector started on path: ' + info.path);
});

fileWatcher.on('delete', function(file){
    log.info('garbage collector deleted  ' + file.name + ' on folder: ' + file.folder  + ', path: ' +file.path); 
});

fileWatcher.on('error', function(err){
    log.info('garbage collector error:  ' + err);
});

fileWatcher.start();

//routers declaration
var PortalRouter =require('./routers/portal.js');
var LoginRouter =require('./routers/login.js');
var ToolAuditRouter =require('./routers/toolaudit.js');
var PreassessmentRouter =require('./routers/preassessaudit.js');
var PlanRouter =require('./routers/planaudit.js');
var FindingsRouter =require('./routers/findingaudit.js');
var MatrixRouter = require('./routers/matricesaudit.js');
var DocsRouter = require('./routers/generatedocs.js');
var AnalyticsRouter = require('./routers/analyticsaudit.js');
var CubeRouter = require('./routers/cube.js');
var AuditRecRouter = require('./routers/auditrec.js');
var AnalyticsPortRouter = require('./routers/analyticsportfolio.js');


// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
    axios.get(`http://localhost:5000/users?email=${email}`)
    .then(res => {
        const user = res.data[0]
        if (!user) {
            return done(null, false, { message: 'Invalid credentials.\n' });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: 'Invalid credentials.\n' });
        }
        return done(null, user);
    })
    .catch(error => done(error));
    }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here');
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    axios.get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data) )
    .catch(error => done(error, false))
});

var app = express();

//View Engine
app.set('view engine','ejs');
//specify folder for views
app.set('views',path.join(__dirname,'views'));

// body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//set static path to be used for support documents, like css or angular
app.use(express.static(path.join(__dirname,'public')));


//to make variables global place them here 
app.use(function(req,res,next){
    //http redirect to https
    if (!req.secure) {
        vHost=req.headers.host
        vHost=vHost.replace(httpPort.toString(), httpsPort.toString());
        return res.redirect("https://" + vHost + req.url);
    };
    //end http redirect to https
    res.locals.errors = null;
    next();
});

// add and configure session middleware
app.use(session({
    genid: (req) => {
      //console.log('Inside the session middleware')
      //log.info(req.sessionID);
       return uuid(); // use UUIDs for session IDs
    },
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/',function(req,res){
    graphdb.CreateDictionary();
    log.info('Session created received the id:' + req.sessionID);
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('./lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);
    
    res.render('index', {
        action: 'home',
        auditfile: AuditFile,
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
        //persons: persons
    });
});

app.get('/index',function(req,res){
    graphdb.CreateDictionary();
    log.info('Session created received the id:' + req.sessionID);
    var AuditFile = credentials.WorkSetPath;
    AuditFile = AuditFile + req.sessionID + '.xml';
    var InitialAudit = require('./lib/initialaudit.js')(AuditFile);
    var status = InitialAudit.VerifyAuditFile(AuditFile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    res.render('index', {
        action: 'home',
        auditfile: AuditFile,
        audit: status,
        rectracking: credentials.portfolio,
        user: user,
        sessionlang: req.session.lang,
        nav: appObjects.pageNavigation
        //persons: persons
    });
});

app.get(('/portal/' + credentials.urlpaths.plugins + ':name'),function(req,res){
    //download xml file
    var file = __dirname + '/' + credentials.urlpaths.plugins + req.params.name
    var file = file.replace("/","\\");
    res.download(file); // Set disposition and send it.
    log.info('plug-in download: ' + file);
});

app.get(('/portal/' + credentials.urlpaths.audittemplates + ':name'),function(req,res){
    //download xml file
    var file = __dirname + '/' + credentials.urlpaths.audittemplates + req.params.name
    var file = file.replace("/","\\");
    res.download(file); // Set disposition and send it.
    log.info('plug-in download: ' + file);
});

app.post(('/work/delete'),function(req,res){
    //download xml file
    var vfile = credentials.WorkSetPath;
    vfile = vfile + req.sessionID + '.xml'
    vfile = vfile.replace("/","\\");

    fs.unlink(vfile, (err) => {
        if (err) throw err;
        log.info('working audit file closed and deleted : ' + vfile);
    });

    var vDocfile = credentials.WorkSetPath;
    vDocfile = vDocfile + req.sessionID + '.' + credentials.ReportFormat
    var InitialAudit = require('./lib/initialaudit.js')(vDocfile);
    var status = InitialAudit.VerifyAuditFile(vDocfile);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        vDocfile = vDocfile.replace("/","\\");

        fs.unlink(vDocfile, (err) => {
            if (err) throw err;
            log.info('document audit file closed and deleted : ' + vDocfile);
        });
    };
    if(req.isAuthenticated()) {
        res.render('portal/toolindex', {
            action: 'tool',
            auditfile: '',
            audit: '',
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    } else {
        res.redirect('/login/login');
    }
});

app.get(('/toolaudit/work/download'),function(req,res){
    //download xml file
    var file = credentials.WorkSetPath + req.sessionID + '.xml'
    var InitialAudit = require('./lib/initialaudit.js')(file);
    var status = InitialAudit.VerifyAuditFile(file);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);

    var appObjects = appLang.GetData(req.session.lang);

    var newFileName = FileAuditID.GetAuditID(file);
    if (newFileName == '') {
        newFileName  = req.sessionID;
    }
    newFileName  = newFileName + '_' + req.session.lang.toUpperCase().substring(0, 2) +'.xml';
    if (status) {
        var file = file.replace("/","\\");
        res.download(file, newFileName); // Set disposition and send it.
        log.info('audit file download: ' + file);
    } else {
        res.render('login/login', {
            action: 'login',
            //persons: persons,
            auditfile: '',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
        });
    }    
});

app.get(('/toolaudit/work/onclose'),function(req,res){
    //download xml file
    var file = credentials.WorkSetPath + req.sessionID + '.xml'
    var InitialAudit = require('./lib/initialaudit.js')(file);
    var status = InitialAudit.VerifyAuditFile(file);

    var user = commonF.GetUser(req);
    req.session.lang = commonF.GetLang(req);
    
    var appObjects = appLang.GetData(req.session.lang);

    if (status) {
        res.render('./portal/onclose', {
            action: 'home',
            auditfile: 'work/' + req.sessionID + '.xml',
            audit: status,
            rectracking: credentials.portfolio,
            user: user,
            sessionlang: req.session.lang,
            nav: appObjects.pageNavigation
            //persons: persons
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


app.get(('/document/work/' + ':name'),function(req,res){
    //download xml file
    var file = credentials.WorkSetPath + req.params.name
    var InitialAudit = require('./lib/initialaudit.js')(file);
    var status = InitialAudit.VerifyAuditFile(file);
    var file = file.replace("/","\\");
    res.download(file); // Set disposition and send it.
});

app.use('/portal', PortalRouter);
app.use('/login', LoginRouter);
app.use('/toolaudit', ToolAuditRouter);
app.use('/preassessaudit', PreassessmentRouter);
app.use('/planaudit', PlanRouter);
app.use('/findingaudit', FindingsRouter);
app.use('/auditMatrices', MatrixRouter);
app.use('/generatedocs', DocsRouter);
app.use('/analytics', AnalyticsRouter);
app.use('/cube', CubeRouter);
app.use('/auditrec',AuditRecRouter);
app.use('/portanalytics', AnalyticsPortRouter);

app.use(function(req,res,next){
    log.warn('404 - Not Found');
    res.type('text/html');
    res.status(404);
    res.render('404');
    //res.send('404 - Not Found');
});

app.use(function(req,res,next){
    log.warn('500 - Server Error');
    res.type('text/html');
    res.status(500);
    res.render('500');
    //res.send('500 - Server Error');
});

//use app in http server
//app.listen(httpsPort,function(){
//    graphdb.CreateDictionary();
//    console.log('Server started on port ' + httpsPort + '...');
//});

//use app in https server
//http to https redirection 
const http = require('http');



//app.use((req, res, next) => {
//    if(req.protocol === 'http') {
//        res.redirect(301, 'https://$(req.headers.host)$(req.url)');
//    }
//    next();
//});

const httpServer = http.createServer(app);
httpServer.listen(httpPort);
//end redirection

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: credentials.passPhrase
},app).listen(httpsPort,function(){
    graphdb.CreateDictionary()
    console.log('Server started on port ' + httpsPort.toString() +'...');
});