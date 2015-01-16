var page = require('webpage').create();
var system = require('system');

var lastReceived = new Date().getTime();
var requestCount = 0;
var responseCount = 0;
var requestIds = [];
var startTime = new Date().getTime();

page.onResourceReceived = function (response) {
	if(requestIds.indexOf(response.id) !== -1) {
		lastReceived = new Date().getTime();
		responseCount++;
		requestIds[requestIds.indexOf(response.id)] = null;
	}
};
page.onResourceRequested = function (request) {
	if(requestIds.indexOf(request.id) === -1) {
		requestIds.push(request.id);
		requestCount++;
	}
};

// Open the page
page.open(system.args[1], function () {});

var checkComplete = function () {
	// Wait until 1.5s after the last request was completed, or 7.5s total.
	if((new Date().getTime() - lastReceived > 1500 && requestCount === responseCount) || new Date().getTime() - startTime > 7500)  {
		clearInterval(checkCompleteInterval);
		console.log(page.content);
		var url = page.evaluate(function() {
			return document.URL;
		})
		console.log('<!-- X-Resolved-URL: ' + url + ' -->');
		phantom.exit();
	}
}
// Let us check to see if the page is finished rendering
var checkCompleteInterval = setInterval(checkComplete, 1);
