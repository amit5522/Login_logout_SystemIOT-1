const OtpServices = require('../services/Otp-services')
const HashService = require('../services/hash-service')
const tokenService = require('../services/token-service')
const User = require('../models/user_model')
const { sendEmail } = require('../utils/sendEmail')
const crypto = require('crypto')
const OTPLIMIT = require('../models/otp-time-limit_model')



const login = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone) {

            throw new Error("Please entre phone number !!")
        } else {
            if (phone.length != 13)
                throw new Error("Invalid phone number")

             //checking user is register or not
             let user = await User.findOne({ phone: phone });   
             if(!user)
               throw new Error("User Not Registered")
            //checking resend otp time
            const otplimit=await OTPLIMIT.findOne({otpDestination:phone})   
            if(otplimit&& otplimit.timelimit>Date.now()){
                  throw new Error("Resend OTP disable for 2 minutes.")
            } 
            //generate otp 
            const otp = await OtpServices.generateOtp();

            //hash otp
            //expire in 2 minutes 
            const ttl = 1000 * 60 * 2;
            const expire = Date.now() + ttl;
            const data = `${otp}`
            const hash = await HashService.hashOtp(data);

            //send otp by sms
            await  OtpServices.sendBySms(phone, otp);

            //set new otplimit time
            if(otplimit){
                otplimit.timelimit=expire;
                await otplimit.save();
            }else{
                await OTPLIMIT.create({ 
                    otpDestination:phone,
                    timelimit:expire
                 })
            }
           
            res.status(201).json({
                "success": true,
                "message": "OTP send successfully",
                "phone": phone,
                "hash": `${hash}.${expire}`

            })
        }

    } catch (error) {
        //console.log(error.message)
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const register = async (req, res) => {
    try {
        const { phone } = req.body

        if (!phone) {

            throw new Error("Please entre phone number !!")
        } else {
            if (phone.length != 13)
                throw new Error("Invalid phone number")

             //checking user is register or not
             let user = await User.findOne({ phone: phone });   
             if(user)
               throw new Error("User already registered")
            //checking resend otp time
            const otplimit=await OTPLIMIT.findOne({otpDestination:phone})   
            if(otplimit&& otplimit.timelimit>Date.now()){
                  throw new Error("Resend OTP disable for 2 minutes.")
            } 
            //generate otp 
            const otp = await OtpServices.generateOtp();

            //hash otp
            //expire in 2 minutes 
            const ttl = 1000 * 60 * 2;
            const expire = Date.now() + ttl;
            const data = `${otp}`
            const hash = await HashService.hashOtp(data);

            //send otp by sms
            await  OtpServices.sendBySms(phone, otp);

            //set new otplimit time
            if(otplimit){
                otplimit.timelimit=expire;
                await otplimit.save();
            }else{
                await OTPLIMIT.create({ 
                    otpDestination:phone,
                    timelimit:expire
                 })
            }
           
            res.status(201).json({
                "success": true,
                "message": "OTP send successfully",
                "phone": phone,
                "hash": `${hash}.${expire}`

            })
        }

    } catch (error) {
        //console.log(error.message)
        res.status(401).json({
            success: false,
            message: error.message
        })
    }
}

const verify_otp = async (req, res) => {
    try {
        const { phone, otp, hash } = req.body;

        if (!phone || !otp || !hash) {
            throw new Error("Please entre all fildes")
        } else {
            const [hashotp, expire] = hash.split('.');
            if (Date.now() > expire) {

                throw new Error("Time Expired");
            } else {

                const verify = await OtpServices.VerifyOtp(hashotp, otp);


                if (verify) {

                    //check user alradey register or not
                    let user = await User.findOne({ phone: phone });

                    //if user not register create new user
                    if (!user)
                        user = await User.create({ phone })

                    //now create access token and refresh token

                    //console.log(user)
                    const { accessToken } = tokenService.generateToken({ _id: user._id });

                   


                    res.cookie('accessToken', accessToken, {
                        expireIn: 1000 * 60 * 60 * 30 * 24,
                        httpOnly: false
                    })

                    res.status(201).json({
                        user,
                        isAuth: true,
                        success: true
                    })

                } else {
                    throw new Error("Invalid OTP")

                }
            }
        }

    }
    catch (error) {
        //console.log(error.message)
        res.status(501).json({
            success: false,
            isAuth: false,
            message: error.message
        })
    }
}



const activate = async (req, res) => {
    try {
        const { _id } = req.user;

        const user = await User.findById(_id);
        const { name, email } = req.body;

        //console.log(req.body)
        if (!name || !email || !user) {

            throw new Error("All fildes require");
        } else {

            user.name = name;
            user.activated = true;
            user.email = email;

            await user.save();
            // console.log(user.avatar)
            res.json({
                isAuth: true,
                user,
                success: true,
                message: "User Activated"

            })



        }

    } catch (error) {
        res.status(401).json({
            activated: false,
            success: false,
            message: error.message
        });
    }
}



const loadUser = async (req, res) => {

    try {
        
        const { _id } = req.user;
        const user = await User.findById(_id);
        res.status(201).json({
            user,
            isAuth: true,
            success: true,
        })
    } catch (error) {
        // console.log(error);
        res.status(401).json({
            success: false,
            isAuth: false,
            message: error.message
        });
    }
}

const logOutUser = async (req, res) => {
    try {


        res.cookie('accessToken', null, {
            expireIn: Date.now(),
            httpOnly: true
        })

        res.status(201).json({
            success: true,
            message: "LogOut Succesfully"
        })
        //console.log("Good")

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in Logout"
        })
    }
}



//user reset password controller
const sendResetOtp = async (req, res) => {
    try {
      //  console.log("hello")
        const { email } = req.body;
        if (!email) {
            throw new Error("All fildes require");
        } else {
            //checking user in database
            const user = await User.findOne({ email: email });
            if (!user)
                throw new Error("User Not Found!!");
             //checking resend otp time
             const otplimit=await OTPLIMIT.findOne({otpDestination:email})   
             if(otplimit&& otplimit.timelimit>Date.now()){
                   throw new Error("Resend OTP disable for 2 minutes.")
             } 
            //generate otp

            const otp = await OtpServices.generateOtp();

            //hash otp
            //expire in 2 minutes 
            const ttl = 1000 * 60 * 2;
            const expire = Date.now() + ttl;
            const data = `${otp}`
            const hash = await HashService.hashOtp(data);

            //send otp on user email
            const options = {
                email: email,
                subject: "Reset phone OTP",
                message: `Your Reset Phone OTP is : ${otp},valid for 2 minutes.`
            }
            await sendEmail(options);

            //set new otplimit time
            if(otplimit){
                otplimit.timelimit=expire;
                await otplimit.save();
            }else{
                await OTPLIMIT.create({ 
                    otpDestination:email,
                    timelimit:expire
                 })
            }
           // console.log(otp)
            res.status(201).json({
                "success": true,
                "message": "OTP send successfully",
                "email": email,
                "hash": `${hash}.${expire}`
            })
        }
    } catch (error) {
        res.status(404).json({
            success: false,
            isAuth: false,
            message: error.message
        })
    }
}

//verify otp-by email 
const verifyemail_otp = async (req, res) => {

    try {
        const { email, otp, hash } = req.body;

        if (!email || !otp || !hash) {
            throw new Error("Please entre all fildes")
        } else {
            const [hashotp, expire] = hash.split('.');
            if (Date.now() > expire) {

                throw new Error("Time Expired");
            } else {

                const verify = await OtpServices.VerifyOtp(hashotp, otp);


                if (verify) {

                    //check user alradey register or not
                    let user = await User.findOne({ email: email });

                    //if user not register create new user
                    if (!user)
                        throw new Error("User Not Found");

                    //create reset token
                    // generate token
                    const resetToken = crypto.randomBytes(20).toString("hex");
                    // chnageMobileToken = crypto.createHash("sha256").update(resetToken).digest("hex");
                    const resetTokenExpire = Date.now() + 2 * 60 * 1000;

                    user.resetToken = resetToken;
                    user.resetTokenExpire = resetTokenExpire;
                    await user.save();

                    res.status(201).json({
                        resetToken,

                        isAuth: false,
                        success: true
                    })

                } else {
                    throw new Error("Invalid OTP")

                }
            }
        }

    }
    catch (error) {
        //console.log(error.message)
        res.status(501).json({
            success: false,
            isAuth: false,
            message: error.message
        })
    }
}

const resetPhone = async (req, res) => {
    try {
        const token = req.params.token;
        const { email, phone } = req.body;
        if (!token || !email || !phone)
            throw new Error("All fields required")

        const user = await User.findOne({ email: email });

        if (user.resetToken != token)
            throw new Error("Invalid Token")

        const date = new Date(user.resetTokenExpire);
        if (date < Date.now())
            throw new Error("Token Expired")

        user.phone = phone;
        user.resetTokenExpire = undefined;
        user.resetToken = undefined;

        await user.save();

        const { accessToken } = tokenService.generateToken({ _id: user._id });



        res.cookie('accessToken', accessToken, {
            expireIn: 1000 * 60 * 60 * 30 * 24,
            httpOnly: false
        })

        res.status(201).json({
            user,
            isAuth: true,
            success: true
        })
    } catch (error) {
        res.status(501).json({
            success: false,
            isAuth: false,
            message: error.message
        })
    }
}

module.exports = {
    register, verify_otp, logOutUser, loadUser,login,
    activate, sendResetOtp, verifyemail_otp, resetPhone
}