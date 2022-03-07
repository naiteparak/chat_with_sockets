const moment = require("moment")

function imageMessage(username, image){
    return{
        username,
        image,
        time: moment().format("h:mm a")
    }
}

module.exports = imageMessage;
