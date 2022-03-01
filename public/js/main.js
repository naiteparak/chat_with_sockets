const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")
const typingBox = document.getElementById("typingBox")

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io()

socket.emit("joinRoom", {username, room})

socket.on("usersRoom", ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on("message", message =>{
 
    outputMessage(message);
    console.log(message);
    //Scroll
    console.log(chatMessages);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

chatForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    //Get message 
    const msg = e.target.elements.msg.value

    socket.emit("chatMessage", msg); 

    //Clear input 
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

chatForm.addEventListener("keypress", ()=>{
    socket.emit("typing", username)
})

socket.on("typing", user =>{
    typing(user)
})

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add("message")
    div.innerHTML = `<p class="meta">${message.username}<span> ${message.time} </span></p>
    <p class="text">
        ${message.text}
    </p>`
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
    }, 3000);
}