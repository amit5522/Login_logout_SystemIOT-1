const Device = require("../models/device_model");



const addDevice = async (req, res) => {

    try {
        const { deviceId, deviceName } = req.body;
        const UserDevices = await Device.findOne({ user: req.user._id });
     
        if (!UserDevices) {
         
           await Device.create({ user: req.user._id,devices:[{deviceId,deviceName }]})
           
        } else {
            for(let device of UserDevices.devices){
                if(device.deviceId==deviceId){
                    throw new Error("Duplicate device Id")
                }
             }
            UserDevices.devices.push({ deviceId, deviceName });
            await UserDevices.save();
        }


        res.status(201).json({
            success: true,
           "message": 'Device added succesfully'

        })



    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const getAllDevices = async (req, res) => {

    try {
        const devices=await Device.findOne({user:req.user._id});
      //  console.log(req.user_id)
        res.status(201).json({
            success: true,
            devices:devices,
           "message": 'All Devices'

        })



    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const editDeviceName = async (req, res) => {

    try {
        const {deviceId,deviceName}=req.body;
        const Userdevices=await Device.findOne({user:req.user._id});
         if(!Userdevices)
           throw new Error("No Device found");
         for(let device of Userdevices.devices){
            if(device.deviceId==deviceId){
                device.deviceName=deviceName;
                break;
            }
         }   
         await Userdevices.save();
        res.status(201).json({
            success: true,
           "message": 'Device name Updated'

        })



    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = { addDevice,getAllDevices,editDeviceName}