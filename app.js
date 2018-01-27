'use strict';
var express=require("express");
var mongoose=require('mongoose');
var bodyParser = require("body-parser");
var path = require("path");
var fs = require("fs");
var schematic = require("./public/schematic.js");
//var mongoClient = require("mongodb").MongoClient;

var app = express();

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path
app.use(express.static(path.join(__dirname, "public")));

var port = 3000;
var db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
mongoose.connect("mongodb://localhost/equalities");
mongoose.Promise = global.Promise;
console.log("MongoDB connected");

// BEGIN Equality Set setup
var equalitySetSchema = mongoose.Schema({
	equality: [{
		horizontal: Boolean,
		before: [[Number]],
		after: [[Number]]}]
});

var EqualitySet = mongoose.model('EqualitySet', equalitySetSchema);

// END Equality Set setup

// POST
app.post('/post/equalityset', function(request, response){
	console.log("Equality Set posted");

	var eqset = new EqualitySet({
		equality: request.body});

	const es=request.body;
	eqset.equality = [];
	for(var i=0;i<es.equality.length;i++){
//		console.log(es.equality[i]);
//		var b=[];
//		for(var j=0;j<es.equality[i].before.length;j++){
//			b.push(es.equality[i].before[j]);
//		}
//		var a=[];
//		for(var j=0;j<es.equality[i].after.length;j++){
//			a.push(es.equality[i].after[j]);
//		}

//		var e={horizontal: es.equality[i].horizontal,
//			before: b,
//			after: a};
		var e={horizontal: es.equality[i].horizontal,
			before: es.equality[i].before,
			after: es.equality[i].after};

		eqset.equality.push(e);
	}
//	eqset.remove();

	eqset.save(function(err){
		if(err) return handleError(err);
	});

//	console.log(request.body);
	console.log(eqset);
	response.send(request.body);
});

// GET equality set, respond with JSON
app.get("/JSON/equalityset", function(request, response){
	var eqset;
	EqualitySet.findOne({}, function(err,eqset){
		if(err) return handleError(err);
		console.log(eqset);
		response.json(eqset);
	});
});

app.listen(port, function(){
	console.log("Server started on port 3000");
});
