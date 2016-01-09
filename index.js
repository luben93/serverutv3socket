var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Rest = require('node-rest-client').Client;
//var crypto = require('crypto');
var rest = new Rest();
//var chats = [];
var users = [];


app.get('/:id/:other', function(req,res){
    //console.log(req.params.id);
    //console.log(req.params.other);
    var room = req.params.id+""+req.params.other;
    res.sendFile(__dirname + '/index.html');
});

 
io.on('connection',function(socket){

    console.log('a user connected default!!!!!!!');
    //TODO login
    
    socket.broadcast.emit('hi');
    
    socket.on('disconnect',function(){
     console.log('user disconnect');
    });
    socket.on('logon',function(path){
        var room=path.match(/([1-9])+/g)[1]+""+path.match(/([1-9])+/g)[0];
        console.log("my id"+socket.id)
        users[room]=socket.id;

        rest.get("http://localhost:8081/rest/chat"+path, function(data,response){
            data.list.forEach(function(msg){
                // rest.get("http://localhost:8081/rest/profile/"+msg.sender,function(data,response){
                //     console.log(data)
                    socket.emit('chat message',msg);
                // });
                
            });
        }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
        });
    });
    socket.on('chat message',function(out){
        
        var matches = out.path.match(/([1-9])+/g);
        var room = matches[0]+""+matches[1];
        console.log(out);
        rest.post("http://localhost:8081/rest/chat",  {
        data: { sender: parseInt(matches[0]), recvier: parseInt(matches[1]), message: out.message },
        headers:{"Content-Type": "application/json"} 
        }, function(data,response) {
            console.log(data+response);
        }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
        });
        out.sender = parseInt(matches[0])
        console.log("other id"+users[room]);
        socket.broadcast.to(users[room]).emit('chat message',out);
        socket.emit('chat message',out);
        //io.emit('chat message',out);
            
    });

});

http.listen(3000, function(){
    console.log('magic *:3000');
});
