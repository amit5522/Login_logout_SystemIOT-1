const mongoose =require('mongoose');


const limitotpSchema =new mongoose.Schema({

    otpDestination:{
        type:String,
        required:true
    },
    timelimit:{
        type:Date,
        required:true
    }
})

const OTPLIMIT = mongoose.model("OTPLIMIT", limitotpSchema);
module.exports = OTPLIMIT;