import {Server,Socket} from "socket.io";
import http from "http";
import express from "express";
import { error } from "console";

const app= express();

const server= http.createServer(app);

const io= new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }})

const userSocketMap:Record<string,String>={};

io.on("connection",(socket:Socket)=>{
    console.log("user connected",socket.id)

    const userId=socket.handshake.query.userId as string ;

    if(userId ){
        userSocketMap[userId]=socket.id
        console.log(`User ${userId} connected with socket id ${socket.id}`)
    }
    
    io.emit("getOnlineUser",Object.keys(userSocketMap));

    if(userId){
        socket.join(userId);
    }
    
     socket.on("typing",(data)=>{
    console.log(`${data.userId} is typing to ${data.chatId}`);
    socket.to(data.chatId).emit("userTyping",{
        chatId:data.chatId,
        userId:data.userId
    })
  })

  socket.on("stopTyping",(data)=>{
    console.log(`${data.userId} stopped typing to ${data.chatId}`);
    socket.to(data.chatId).emit("userStoppedTyping",{
        chatId:data.chatId,
        userId:data.userId
    })
  })

  socket.on("joinchat",(chatId)=>{
     socket.join(chatId);
    console.log(`${userId} joined chat ${chatId}`);
   
  })
  socket.on("leavechat",(chatId)=>{
    socket.leave(chatId);
    console.log(`${userId} left chat ${chatId}`);
  })

    socket.on("disconnect",()=>{  
        console.log("user disconnected",socket.id)

        if(userId){
            delete userSocketMap[userId];
            console.log(`User ${userId} disconnected from online users`)
            io.emit("getOnlineUser",Object.keys(userSocketMap));
        }
    });

    socket.on("connect_error",(error)=>{
        console.log("socket connection error",error)
    });

})

export {app,server,io}