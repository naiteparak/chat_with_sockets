const chatForm = document.getElementById("chat-form")
const chatMessages = document.querySelector(".chat-messages")
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")
const typingBox = document.getElementById("typingBox")
const uploadImg = document.getElementById("upload")
const voiceMessage = document.getElementById("voiceMessage")
const recordButton = document.getElementById("recordButton");
const transcribeButton = document.getElementById("transcribeButton");
const audioOutput = document.getElementById("audioOutput")

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

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on("audio", audio=>{
    uploadAudio(audio)

    chatMessages.scrollTop = chatMessages.scrollHeight;
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

recordButton.addEventListener("click", (e)=>{
    startRecording()
});

transcribeButton.addEventListener("click",(e)=>{
    transcribeText()
});

let rec = null;
let audioStream = null;

function startRecording() {

    let constraints = { audio: true, video:false }

    recordButton.disabled = true;
    transcribeButton.disabled = false;

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        const audioContext = new window.AudioContext();
        audioStream = stream;
        const input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input, { numChannels: 1 })
        rec.record()
        document.getElementById("audioOutput").innerHTML = "Recording started..."
    }).catch(function(err) {
        recordButton.disabled = false;
        transcribeButton.disabled = true;
    });
}

function transcribeText() {
    transcribeButton.disabled = true;
    recordButton.disabled = false;
    rec.stop();
    audioStream.getAudioTracks()[0].stop();
    rec.exportWAV(uploadSoundData);
}

function uploadSoundData(blob) {
    const filename = "audio-file-" + new Date().getTime() + ".aac";
    const formData = new FormData();
    formData.append("audio_data", blob, filename);
    
    fetch('http://localhost:80/notes', {
        method: 'POST',
        body: formData
    }).then(async result => { 
        document.getElementById("audioOutput").innerHTML = `<p>${await result.text()}</p>`
        socket.emit("audioUpload")
    }).catch(error => { 
        document.getElementById("audioOutput").innerHTML = "An error occurred: " + error;
    })
}

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

function uploadAudio(audio){
    const div = document.createElement('div');
    div.classList.add("upload")
    div.innerHTML = `<p class="text">${audio.username}<span> ${audio.time} </span></p>
    <audio controls>
        <source src="../audio_files/${audio.audio}" type="audio/aac">
    </audio>
` 
    document.querySelector(".chat-messages").appendChild(div)
}