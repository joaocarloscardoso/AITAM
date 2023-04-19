//credentials used in the app
var credentials = require('../credentials.js');

//logging system
var log = require('./log.js');

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var urlDB = credentials.mongoDB.urlDB;

function SaveData(myquery, data){
    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db(credentials.mongoDB.dbportfolio);
        //var myquery = { requestid: RequestID };
        dbo.collection(credentials.mongoDB.colportfolio).deleteMany(myquery, function(err, obj) {
            if (err) throw err;
            dbo.collection(credentials.mongoDB.colportfolio).insertOne(data, function(err, res) {
                if (err) throw err;
                console.log("Document inserted");
                db.close();
            });
        });
    });
};

function InsertData(data, dbCollection){
    console.log(dbCollection);
    return new Promise(function(resolve, reject){
        MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db(credentials.mongoDB.dbportfolio);
            //var myquery = { answer: "no" };
            dbo.collection(dbCollection).insertOne(data, function(err, res) {
                if (err) throw err;
                console.log("Document inserted");
                resolve(res.insertedId);
                db.close();
            });
        });
    });
};

function InsertHistory(data, dbCollection){
    return new Promise(function(resolve, reject){

        const db_connnect_string = urlDB + credentials.mongoDB.dbportfolio;
        const db1 = new MongoClient(db_connnect_string);

        //console.log('Connecting to DB @ ${db_connnect_string}...');

        db1.connect().catch((err) => {
        if (err) throw err;
        }).then(() => {
            //console.log('Successfully Connected to DB');
        });
        var dbo = db1.db(credentials.mongoDB.dbportfolio);
        dbo.collection(dbCollection).insertOne(data, function(err, res) {
            if (err) throw err;
            //console.log("Document inserted");
            resolve(res.insertedId);
            db1.close();
        });
    });
};

/*
function QueryHistory(myquery, myfields, sortfields, dbCollection){
    return new Promise(function(resolve, reject){

        const db_connnect_string = urlDB + credentials.mongoDB.dbportfolio; 
        const db1 = new MongoClient(db_connnect_string);

        //console.log('Connecting to DB @ ${db_connnect_string}...');

        db1.connect().catch((err) => {
        if (err) throw err;
        }).then(() => {
            //console.log('Successfully Connected to DB');
        });
        var dbo = db1.db(credentials.mongoDB.dbportfolio);

        dbo.collection(dbCollection).find(myquery, { projection: myfields }).toArray(function(err, result) {
            if (err) throw err;
            resolve(result);
            console.log('aaa');
            dbo.close();
        });

    });
};
*/
async function QueryHistory(myquery, myfields, sortfields, dbCollection) {
    const db_connnect_string = urlDB + credentials.mongoDB.dbportfolio; 
    const db1 = new MongoClient(db_connnect_string);
    try {

        //console.log('Connecting to DB @ ${db_connnect_string}...');

        db1.connect().catch((err) => {
        if (err) throw err;
        }).then(() => {
            //console.log('Successfully Connected to DB');
        });
        var dbo = db1.db(credentials.mongoDB.dbportfolio);
        const docs = dbo.collection(dbCollection);

        const options = {
            // sort matched documents in descending order by rating
            sort: sortfields,
            // Include only the `title` and `imdb` fields in the returned document
            projection: myfields,
            };
        const result = await docs.findOne(myquery, options);
        // since this method returns the matched document, not a cursor, print it directly
        return Promise.resolve(result.doc)
    } finally {
        await db1.close();

    }
};

function DeleteHistory(myquery, dbCollection){
    return new Promise(function(resolve, reject){

        const db_connnect_string = urlDB + credentials.mongoDB.dbportfolio;
        const db1 = new MongoClient(db_connnect_string);

        //console.log('Connecting to DB @ ${db_connnect_string}...');
        //console.log('delete');
        db1.connect().catch((err) => {
        if (err) throw err;
        }).then(() => {
            //console.log('Successfully Connected to DB');
        });
        var dbo = db1.db(credentials.mongoDB.dbportfolio);
        dbo.collection(dbCollection).deleteMany(myquery, function(err, obj) {
            if (err) throw err;
            console.log("history deleted");
            db1.close();
        });
    });
};

function UpdateData(userid, id, data){
    var myquery = {userid: userid,
        _id: ObjectID(id)
    };

    return new Promise(function(resolve, reject){
        MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;                
            var dbo = db.db(credentials.mongoDB.dbportfolio);       
            dbo.collection(credentials.mongoDB.colportfolio).updateOne(myquery, data, function(err, res) {
                if (err) throw err;
                console.log(res.result.nModified + " Document updated");
                resolve(res.result.nModified);
                db.close();
            });
        });
    });
};

function DeleteData(myquery){
    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db(credentials.mongoDB.dbportfolio);
        //var myquery = { requestid: RequestID };
        dbo.collection(credentials.mongoDB.colportfolio).deleteMany(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Document deleted");
            db.close();
        });
    });
};

function QueryData(myquery, myfields, sortfields){
    return new Promise(function(resolve, reject){
        MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db(credentials.mongoDB.dbportfolio);
            //var myquery = { answer: "no" };
            dbo.collection(credentials.mongoDB.colportfolio).find(myquery, { projection: myfields }).sort(sortfields).toArray(function(err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    });
};

function QueryDataByID(myqueryId, myfields, sortfields){
    var ObjectId = require('mongodb').ObjectId; 
    return new Promise(function(resolve, reject){
        MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db(credentials.mongoDB.dbportfolio);
            //var myquery = { answer: "no" };
            dbo.collection(credentials.mongoDB.colportfolio).find({ _id: ObjectId(myqueryId) }, { projection: myfields }).sort(sortfields).toArray(function(err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    });
};

//last published
//db.col.find().sort({"datepub": -1}).limit(1)

/*
function CreateRequestCUBE(SessionID, RequestID, ObjectID, Subject, userID) {

    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;

        var date = new Date();

        var dbo = db.db("notifications");
        var myobj = {   sessionid: SessionID, 
                        requestid: RequestID,
                        userid: userID,
                        requestdate: date,
                        objectid: ObjectID,
                        subject: Subject,
                        url: '',
                        explanation: '',
                        answer: "no"
                    };

        dbo.collection("notifications").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("Document inserted");
            db.close();
        });
    });

};

function UpdateDataCUBE(RequestID, url, explanation){
    console.log(RequestID);
    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        
        var dbo = db.db("notifications");
        
        var myquery = { requestid: RequestID };
        
        var newvalues = { $set: {url: url, explanation: explanation, answer: "yes" } };
        dbo.collection("notifications").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
};

function DeleteByRequestID(RequestID){
    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("notifications");
        var myquery = { requestid: RequestID };
        dbo.collection("notifications").deleteMany(myquery, function(err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            db.close();
        });
    });
};

function DeleteBySessionID(SessionID){
    MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("notifications");
        var myquery = { sessionid: SessionID };
        dbo.collection("notifications").deleteMany(myquery, function(err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            db.close();
        });
    });
};

function GetOpenRequests(){
    return new Promise(function(resolve, reject){
        MongoClient.connect(urlDB, { useUnifiedTopology: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("notifications");
            var myquery = { answer: "no" };
            dbo.collection("notifications").find(myquery, { projection: { _id: 0, sessionid: 1, requestid: 1, userid: 1 } }).toArray(function(err, result) {
                if (err) throw err;
                resolve(result);
                db.close();
            });
        });
    });
};
*/

module.exports.SaveData = SaveData;
module.exports.InsertData = InsertData;
module.exports.InsertHistory = InsertHistory;
module.exports.QueryHistory = QueryHistory;
module.exports.DeleteHistory = DeleteHistory;
module.exports.UpdateData = UpdateData;
module.exports.DeleteData = DeleteData;
module.exports.QueryData = QueryData;
module.exports.QueryDataByID = QueryDataByID;
