var express=require('express');
var app = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);
 app.configure(function () {
        app.use(express.static(__dirname + '/'));
    });
//server.listen(8000);
var ipaddr = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1" ;
var port =   process.env.OPENSHIFT_NODEJS_PORT || 80 ;



  server.listen(port  , ipaddr) ;