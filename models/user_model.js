
const mongoose = require('mongoose');
const { isEmail } = require('validator')
const userSchema = new mongoose.Schema({

    phone: {
        type: String,
        required: [true, "Please Entre Phone Number"],
        minLength: [13, "Invalid Phone Number"],
        maxLength: [13, "Invalid Phone Number"]
    },
    name: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true,
        validate: [isEmail, 'Invalid Email']
    },
    activated: {
        type: Boolean,
        default: false
    },
    devices: [{
       
            type: String,
            unique: true

        
    }],
    resetToken: String,
    resetTokenExpire: Date,
},
    {
        timestamps: true
    },

)

const User = mongoose.model("User", userSchema);
module.exports = User;