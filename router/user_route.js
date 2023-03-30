const router = require('express').Router();
const {register,verify_otp,
    login, 
    loadUser, logOutUser, activate,
    sendResetOtp,
    verifyemail_otp,
    resetPhone 
}=require('../controller/userController');
const authMiddleware = require('../middleware/auth-middleware');

//login signup route
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/verify-otp').post(verify_otp);

//activate user -
//add user name and email 
router.route('/activate-user').post(authMiddleware.isAuth,activate);

//load user
router.route('/load-user').get(authMiddleware.isAuth,loadUser);

//Reset user user phone number -by eamil
router.route('/resetotpsend').post(sendResetOtp)
router.route('/resetotpverify').post(verifyemail_otp)

//reset route
router.route('/phone/reset/:token').put(resetPhone);


//logout user
router.route('/logout-user').get(logOutUser);











module.exports=router