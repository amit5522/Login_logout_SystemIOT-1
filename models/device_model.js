
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({

   user:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
   
   },
    devices: [{
         deviceId:{
            type: String,
            unique: true},
         deviceName:{
            type:String,
            unique:true,
         }   
}]
}

)

const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;