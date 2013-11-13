var express=require('express');
var app = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);
 app.configure(function () {
        app.use(express.static(__dirname + '/'));
    });
server.listen(8000);