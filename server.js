const path = require("path");
const http = require("http")
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./public/utils/messages")
const imageMessage = require("./public/utils/imageMessage")
const {userJoin, getCurrentUser, userLeav, getRoomUsers} = require("./public/utils/users");
const fs = require('fs')
const { v4: uuid } = require('uuid');

const app = express();
const server = http.createServer(app)
const io = socketio(server)

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

    socket.on("imgUpload", (img)=>{
        const imgName = uuid()
        const buffer = img
        const user = getCurrentUser(socket.id)
        fs.writeFileSync("./public/images/" + imgName + ".jpg", buffer);
        io.to(user.room).emit("upload", imageMessage(user.username, imgName) )
    })

    socket.on("disconnect", ()=>{
        const user = userLeav(socket.id)
        if (user){
            io.to(user.room).emit("message", formatMessage(admin, `${user.username} has left the chat`))
        }
    });    
})

//If image folder does not exist, folder will be created 

const imageFile = fs.existsSync("./public/images")

if(!imageFile){
    fs.mkdir("./public/images",  (err)=>{
        if(err) console.log(err);
    })
    console.log("Image folder has been created")
}


//Cron for deletig images

fs.readdir("public/images", (err, files) => {
    if (err) {
      console.error("Could not list the directory.", err);
      process.exit(1);
    }
    if(files.length >= 5){
        files.forEach((file )=>{
            fs.unlink(`public/images/${file}`, (err) =>{
                if (err) console.log(err);
                // if no error, file has been deleted successfully
            })
        })
        console.log('Images deleted!')
    }
})

const PORT = 80 || process.env.PORT;

server.listen(PORT, ()=> {console.log(`Server running on http://localhost:${PORT}`);});