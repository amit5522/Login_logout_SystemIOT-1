const User = require('../models/user_model');
const tokenService = require('../services/token-service')
class Auth_middleware {


    async isAuth(req, res, next) {
        try {
         
         const accessToken  = JSON.parse(req.headers.authorization);
           console.log(req.headers);
            if (!accessToken || accessToken == null||accessToken.length<=6) {
                throw new Error("Please login to access resources!!");

 
            }
            else {

                const {_id} = await tokenService.verifyAccessToken(accessToken);
                const user=await User.findById(_id);
                req.user = user;

                next();
            }
        } catch (error) {
            // console.log(error)
            res.status(401).json({
                success: false,
                message: error.message
            })
        }
    }


async isActivated(req, res, next) {
    try {
           // console.log(req.user)
           if(!req.user.activated)
              throw new Error("User not activated")
            next();
        }
     catch (error) {
        // console.log(error)
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}
}

module.exports = new Auth_middleware();