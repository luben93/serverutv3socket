var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Rest = require('node-rest-client').Client;
var crypto = require('crypto');
var rest = new Rest();
var chats = [];
var users = [];


app.get('/:id/:other', function(req,res){
    console.log(req.params.id);
    console.log(req.params.other);
    var room = req.params.id+""+req.params.other;
    // if(req.params.id > req.params.other){
    //         room = req.params.other+""+req.params.id;
    // }
    // if (typeof chats.room == "undefined") {
    //         chats[room] = io.of(room)
    // }

    // res.sendFile(__dirname + '/index.html');
    // console.log("sent index room "+ room)
    // chats[room].on('connection',function(socket){
    //     console.log('a user connected');
    //     socket.emit('chat message',{message: "hej",sender: "me"});
    //         //TOPDO login
            
    //         socket.broadcast.emit('hi');
            
    //         socket.on('disconnect',function(){
    //          console.log('user disconnect');
    //         });
    //         socket.on('logon',function(path){
                
    //             rest.get("http://localhost:8081/rest/chat"+path, function(data,response){
    //                 data.list.forEach(function(msg){
    //                     socket.emit('chat message',msg);
    //                 });
    //             });
    //         });
    //         socket.on('chat message',function(out){
                
    //             var matches = out.path.match(/([1-9])+/g);
    //             console.log(out);
    //             rest.post("http://localhost:8081/rest/chat",  {
    //             data: { sender: parseInt(matches[0]), recvier: parseInt(matches[1]), message: out.message },
    //             headers:{"Content-Type": "application/json"} 
    //             }, function(data,response) {
    //                 //console.log(data+response);
    //             });
    //             out.sender = parseInt(matches[0])
    //             socket.emit('chat message',out);
    //     });
    // });
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
                //io.emit('chat message',msg);
                socket.emit('chat message',msg);
            });
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
        });
        out.sender = parseInt(matches[0])
        console.log("other id"+users[room]);
        socket.broadcast.to(users[room]).emit('chat message',out);
        socket.emit('chat message',out);
        //io.emit('chat message',out);
            
    });
});

//io.on('connection',function(Msocket){
//     Msocket.on('logon',function(path){
//         console.log("in io")
//         var room=path.match(/([1-9])+/g)[1]+""+path.match(/([1-9])+/g)[0];
//         if(path.match(/([1-9])+/g)[0]<path.match(/([1-9])+/g)[1]){
//             room = path.match(/([1-9])+/g)[0]+""+path.match(/([1-9])+/g)[1]
//         }
//         if (typeof chats.room == "undefined") {
//             chats[room] = io.of(room)
//         }

//         Msocket.emit('logged on',"/"+room) 
//         console.log(room)
//         chats[room].on('connection', function(socket){

//             console.log('a user connected');
//             //TOPDO login
            
//             socket.broadcast.emit('hi');
            
//             socket.on('disconnect',function(){
//              console.log('user disconnect');
//             });
//             socket.on('logon room',function(path){
                
//                 rest.get("http://localhost:8081/rest/chat"+path, function(data,response){
//                     data.list.forEach(function(msg){
//                         io.emit('chat message',msg);
//                     });
//                 });
//             });
//             socket.on('chat message',function(out){
                
//                 var matches = out.path.match(/([1-9])+/g);
//                 console.log(out);
//                 rest.post("http://localhost:8081/rest/chat",  {
//                 data: { sender: parseInt(matches[0]), recvier: parseInt(matches[1]), message: out.message },
//                 headers:{"Content-Type": "application/json"} 
//                 }, function(data,response) {
//                     console.log(data+response);
//                 });
//                 out.sender = parseInt(matches[0])
//              io.emit('chat message',out);
//             });
//         })
//     });

// });
http.listen(3000, function(){
    console.log('magic *:3000');
});
