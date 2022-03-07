const moment = require("moment")

function imageMessage(username, image){
    return{
        username,
        image,
        time: moment().format("HH:mm A")
    }
}

module.exports = imageMessage;
