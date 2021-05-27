var nodemailer = require('nodemailer');
//logging system
var log = require('./log.js');

module.exports = function(credentials){

	/*var mailTransport = nodemailer.createTransport('SMTP',{
		service: 'Gmail',
		auth: {
			user: credentials.gmail.user,
			pass: credentials.gmail.password,
		}
	});*/

	//will have to turn on less secure apps from google
	//var mailTransport = nodemailer.createTransport("smtps://" + credentials.gmail.user + ":" +encodeURIComponent(credentials.gmail.password) + "@smtp.gmail.com:465");

	let mailTransport = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
		  user: credentials.gmail.user, // generated ethereal user
		  pass: encodeURIComponent(credentials.gmail.password) // generated ethereal password
		}
	});

	var from = '"AITAM team" <info@aitam.com>';
	var errorRecipient = credentials.gmail.user;

	return {
		send: function(to, subj, body){
			log.info('mail sent from: ' + from);
			mailTransport.sendMail({
				from: from,
				to: to,
				subject: subj,
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err) log.crit('Unable to send email: ' + err);
			});

		},

		emailError: function(message, filename, exception){
			var body = '<h1>AITAM Site Error</h1>' +
				'message:<br><pre>' + message + '</pre><br>';

            if(exception) body += 'exception:<br><pre>' + exception + '</pre><br>';
			if(filename) body += 'filename:<br><pre>' + filename + '</pre><br>';

            mailTransport.sendMail({
				from: from,
				to: errorRecipient,
				subject: 'AITAM Site Error',
				html: body,
				generateTextFromHtml: true
			}, function(err){
				if(err) log.crit('Unable to send email: ' + err);
			});
		},
	};
};


