'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	
	app.route('/timeStamp/*')
		.get(function(req,res){
			var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

			var queryTime = req.path.slice(11);
			queryTime = decodeURI(queryTime);
			var d;
			var jsonObj = {"unix":null,"narutal":null};
			if(isNaN(queryTime)){
				//console.log(queryTime);
				var timestamp=Date.parse(queryTime);
				if(isNaN(timestamp)){
					res.jsonp(jsonObj);
				}
				else{
					d=new Date(timestamp);
				}
			}
			else{
				d = new Date(parseInt(queryTime)*1000);
			}
			//console.log(d);
			jsonObj.unix=d.getTime()/1000;
			jsonObj.narutal=monthNames[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
			res.jsonp(jsonObj);
		});

	app.route('/')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/index.html');
		});

	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
