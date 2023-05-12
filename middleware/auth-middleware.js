const User = require('../models/user_model');
const tokenService = require('../services/token-service')
class Auth_middleware {


    async isAuth(req, res, next) {
        try {
         
         let accessToken  = req.headers.authorization;
         // console.log(req.headers);
            if (!accessToken || accessToken == null||accessToken.length<=6) {
                throw new Error("Please login to access resources!!");

 
            }
            else {
                
                
                const {_id} = await tokenService.verifyAccessToken(accessToken);
                const user=await User.findById(_id);
             //   console.log(_id);
                if(!user){
                    
                    throw new Error("Please login to access resources!!");
                }

                req.user = user;
                
                next();
            }
        } catch (error) {
             
            res.status(401).json({
                success: false,
                message: error.message
            })
        }
    }


async isActivated(req, res, next) {
    try {
           if(!req.user.activated)
              throw new Error("User not activated")
            next();
        }
     catch (error) {
        console.log(error)
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}
}

module.exports = new Auth_middleware();