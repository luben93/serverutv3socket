var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Rest = require('node-rest-client').Client;
var crypto = require('crypto');
var rest = new Rest();
var currentUsers = {};
var otherName="";

app.get('/:id/:other', function(req,res){
//app.get('/', function(req,res){
    // console.log(req.params.id);
    // console.log(req.params.other);
    res.sendFile(__dirname + '/index.html');
});

function getProfileName(id){
    console.log("getting profile name")
if (otherName == ""){
    rest.get("http://localhost:8081/rest/profile/"+id), function(data,response){
        console.log(data);
        otherName=data.name;
    }
}
return otherName;
}


io.on('connection',function(socket){
    var id = 0;
    var other = 0;

    console.log('a user connected w/'+socket.id);
    //TODO login
    socket.broadcast.emit('hi');
    
    socket.on('disconnect',function(){
    	console.log('user disconnect');
    });
    socket.on('logon',function(path){
        id = path.match(/([1-9])+/)[0]
        other = path.match(/([1-9])+/)[1]

        rest.get("http://localhost:8081/rest/chat"+path, function(data,response){
            console.log(data);
            data.list.forEach(function(msg){
                 if (msg.sender==id){
                     //io.emit('chat message','<div style="float: left;">'+msg.message+"</div>");
                    msg.sender="you"
                 }else{
                     //io.emit('chat message','<div style="float: right;">'+msg.message+"</div>");
                    //msg.sender=getProfileName(msg.recvier)
                 }
                io.emit('chat message',msg);


            });
            //currentUsers[path.match(/([1-9])+/)[0]] = socket.id;

        }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
        });
    });
    socket.on('chat message',function(out){
        
        var matches = out.path.match(/([1-9])+/g);
        console.log(matches);
        rest.post("http://localhost:8081/rest/chat",  {
        data: { sender: parseInt(matches[0]), recvier: parseInt(matches[0]), message: out.msg },
        headers:{"Content-Type": "application/json"} 
        }, function(data,response) {
            console.log(data+response);
        }).on('error',function(err){
            console.log('something went wrong on the request', err.request.options);
        });
        
        io.sockets.connected[currentUsers[out.path.match(/([1-9])+/)[1]]].emit('chat message',out.msg);
        //currentUsers[out.path.match(/([1-9])+/)[1]].emit('chat message',out.msg);

//    	io.emit('chat message',out.msg);
    });
})


http.listen(3000, function(){
    console.log('magic *:3000');
});
