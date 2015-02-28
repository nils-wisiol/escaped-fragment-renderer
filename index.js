// web.js

// Express is our web server that can handle request
var express = require('express');
var app = express();


var getContent = function(url, acceptLanguage, callback) {
	var content = '';
	// Here we spawn a phantom.js process, the first element of the 
	// array is our phantomjs script and the second element is our url 
	var phantom = require('child_process').spawn('phantomjs', ['phantom-server.js', url, acceptLanguage]);
	phantom.stdout.setEncoding('utf8');
	// Our phantom.js script is simply logging the output and
	// we access it here through stdout
	phantom.stdout.on('data', function(data) {
		content += data.toString();
	});
	phantom.on('exit', function(code) {
		if (code !== 0) {
			console.log('We have an error');
		} else {
			// once our phantom.js script exits, let's call out call back
			// which outputs the contents to the page
			callback(content);
		}
	});
};

var respond = function (req, res) {
	var url = 'http://localhost:9000/#!' + decodeURIComponent(req.query['_escaped_fragment_']);
	var acceptLanguage = req.header('Accept-Language');
	
	console.log(acceptLanguage + ': ' + url);
	
	getContent(url, acceptLanguage, function (content) {
		res.set({'X-Original-URL': url});
		res.set({'X-Resolved-URL': (content.match(/<!-- X-Resolved-URL: ((.*)) -->/) || ["",""])[1]})
		res.set({'Expires': 'Thu, 31 Dec 2037 23:55:55 GMT'});
		res.send(content);
	});
}

app.get(/(.*)/, respond);
app.listen(3000);
