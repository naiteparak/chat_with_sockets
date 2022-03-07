const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")
const typingBox = document.getElementById("typingBox")
const uploadImg = document.getElementById("upload")



const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

socket.emit("joinRoom", {username, room})

socket.on("usersRoom", ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on("message", (message) =>{
    outputMessage(message);

    //Scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on("upload", (image)=>{
    upload(image)

    chatMessages.scrollTo(0, chatMessages.scrollHeight)
})


socket.on("typing", user =>{
    typing(user)
})

chatForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    //Get message 
    const msg = e.target.elements.msg.value

    if(msg.trim() === ""){
        console.log("g");
        e.target.elements.msg.value = "";
        e.target.elements.msg.focus();
    } else { 
        socket.emit("chatMessage", msg)
    } 

    //Clear input 
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

uploadImg.addEventListener("submit", (e)=>{
    e.preventDefault()
    socket.emit("imgUpload", e.target.elements.image.files[0]);    
    
    //Clear file name in input 
    e.target.elements.image.value = ""
})

chatForm.addEventListener("keypress", ()=>{
    socket.emit("typing", username)
})

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add("message")
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time} </span></p>
    <p class="text">
        ${message.text}
    </p>`
    typingBox.innerHTML = ""
    document.querySelector(".chat-messages").appendChild(div)
    
}

function outputRoomName(room){
    roomName.innerText = room
}

function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join("")}
    `
}

function typing(user){
    typingBox.innerHTML = `<p><b>${user}</b> is typing...</p>`
    setTimeout(() => {
        typingBox.innerHTML = ""
    }, 5000);
}

function upload(url){
    const div = document.createElement('div');
    div.classList.add("upload")
    div.innerHTML = `<p class="text">${url.username}<span> ${url.time} </span></p>
    <img src="../images/${url.image}.jpg" width ="450 px, height="auto" />
    `
    document.querySelector(".chat-messages").appendChild(div)
}
