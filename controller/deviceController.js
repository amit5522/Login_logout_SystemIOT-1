const User = require("../models/user_model");


const addDevice=async(req,res)=>{

    try {
        const {deviceId}=req.body;

        const user= await User.findById(req.user._id);
        
        const device_id=user.devices.find(id=>id===deviceId);
        if(!device_id)
        {user.devices.push(deviceId);
        await user.save();
    }
          
       const alldevices=user.devices;
       res.status(201).json({
        success:true,
        alldevices,
        "message":'Device added succesfully'

       })
          


    } catch (error) {
        res.status(401).json({
            success:false,
            message:error.message
        })
    }
}


module.exports={addDevice}