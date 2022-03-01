const path = require("path");
const http = require("http")
const express = require("express");
const sockertio = require("socket.io");
const formatMessage = require("./public/utils/messages")
const {userJoin, getCurrentUser, userLeav, getRoomUsers} = require("./public/utils/users");

const app = express();
const server = http.createServer(app)
const io = sockertio(server)

app.use(express.static(path.join(__dirname, "public")))
const admin = "Admin"

io.on("connection", socket=>{
    socket.on('joinRoom', ({username, room}) =>{
        const user = userJoin(socket.id, username, room);

        socket.join(user.room)

        socket.emit("message", formatMessage(admin, "Welcome to chat"));

        socket.broadcast
            .to(user.room)
            .emit("message", formatMessage(admin, `${user.username} has joined the chat`))

        //Send info
        io.to(user.room).emit("usersRoom", {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        
    })

    socket.on("chatMessage", (msg)=>{
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit("message", formatMessage(user.username, msg))
    })
    
    socket.on("typing", name=>{
        const user = getCurrentUser(socket.id)
        socket.broadcast
            .to(user.room)
            .emit("typing", name)
    })

    socket.on("disconnect", ()=>{
        const user = userLeav(socket.id)
        if (user){
            io.to(user.room).emit("message", formatMessage(admin, `${user.username} has left the chat`))
        }
    });
})

const PORT = 80 || process.env.PORT;

server.listen(PORT, ()=> {console.log(`Server running on http://localhost:${PORT}`);});