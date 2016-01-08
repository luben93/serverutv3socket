var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Rest = require('node-rest-client').Client;
var crypto = require('crypto');
var rest = new Rest();
var chats = {};


app.get('/:id/:other', function(req,res){
    //console.log(req.params.id);
    //console.log(req.params.other);
    res.sendFile(__dirname + '/index.html');
});


io.on('connection',function(socket){
    socket.on('logon',function(path){
        console.log("in io")
        var room=path.match(/([1-9])+/g)[1]+""+path.match(/([1-9])+/g)[0];
        if(path.match(/([1-9])+/g)[0]<path.match(/([1-9])+/g)[1]){
            room = path.match(/([1-9])+/g)[0]+""+path.match(/([1-9])+/g)[1]
        }
        if (typeof chats.room == "undefined") {
            chats.room = io.of(room)
        }

        socket.emit('logged on',"/"+room) 
        console.log(chats.room)
        chats.room.on('connection', function(socket){

            console.log('a user connected');
            //TODO login
            
            socket.broadcast.emit('hi');
            
            socket.on('disconnect',function(){
            	console.log('user disconnect');
            });
            socket.on('logon room',function(path){
                
                rest.get("http://localhost:8081/rest/chat"+path, function(data,response){
                    data.list.forEach(function(msg){
                        io.emit('chat message',msg);
                    });
                });
            });
            socket.on('chat message',function(out){
                
                var matches = out.path.match(/([1-9])+/g);
                console.log(matches);
                rest.post("http://localhost:8081/rest/chat",  {
                data: { sender: parseInt(matches[0]), recvier: parseInt(matches[1]), message: out.message },
                headers:{"Content-Type": "application/json"} 
                }, function(data,response) {
                    console.log(data+response);
                });
                out.sender = parseInt(matches[0])
            	io.emit('chat message',out);
            });
        })
    });

});
http.listen(3000, function(){
    console.log('magic *:3000');
});
