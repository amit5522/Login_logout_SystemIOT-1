const crypto = require('crypto');
const HashService =require('../services/hash-service')
const fast2sms = require('fast-two-sms')
const dotenv =require("dotenv");
dotenv.config();




class OtpServiecs{

    async generateOtp(){

       const otp= crypto.randomInt(1000,9999);
       return otp;
    }


   async sendBySms(phone,otp){
    

    var options = {authorization :process.env.API_KEY,message : `Your Ginger OTP is :${otp} valid for 2 minutes` ,numbers : [phone]} 
       
      return await fast2sms.sendMessage(options)
    }



   async VerifyOtp(hashotp,otp){
       
        const opt_hash= await HashService.hashOtp(otp);
        
        return opt_hash==hashotp;
    }
}

module.exports =new OtpServiecs();