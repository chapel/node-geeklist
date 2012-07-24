var async = require('async')
  , gklst = (require('../lib/geeklist')).create()
  , geeks = []
	, recordsPage = 0
  , recordsPerCall = 50
  , lastRetrievedCount = recordsPerCall;

async.whilst(
	function() { 
		return lastRetrievedCount == recordsPerCall; 
	},
	
	function(callback) {
		gklst.users('chapel').followers({ count: recordsPerCall, page: ++recordsPage }, function(err, followers) {
			lastRetrievedCount = followers.length;

			geeks = geeks.concat(followers);

			callback();
		});
	},

	function(err) {
		console.log('loaded %s followers', geeks.length);
	}
);