const moment = require("moment")

function audioMessage(username, audio){
    return{
        username,
        audio,
        time: moment().format("HH:mm A")
    }
}

module.exports = audioMessage;
