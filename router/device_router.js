const router = require('express').Router();
const { addDevice,getAllDevices, editDeviceName } = require('../controller/deviceController');
const authMiddleware = require('../middleware/auth-middleware');

//id and name
router.route('/add-device').put(authMiddleware.isAuth,authMiddleware.isActivated,addDevice)
//get all device
router.route('/get-All-devices').get(authMiddleware.isAuth,authMiddleware.isActivated,getAllDevices)
//edit device name
router.route('/update-device-name').put(authMiddleware.isAuth,authMiddleware.isActivated,editDeviceName)






module.exports=router;