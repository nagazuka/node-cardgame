//var redis = require('redis');
//var client = redis.createClient();

//dummy operation
var incr = function(field, callback) {
    callback(null, 1);
}

module.exports = {incr: incr}
