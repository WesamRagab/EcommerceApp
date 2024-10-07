const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100,


    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,

    },
    confirmPassword : {
        type: String,
        required: true,
        trim: true,
        minlength: 8},

    isAdmin: {
        type: Boolean,
        default: false
    },
    resetPasswordOTP: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
}, {
    timestamps: true,

});


// Generate token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET);

}


const User = mongoose.model('User', userSchema);


//validate user's registration

function validateRegisteredUser(obj) {

    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
        confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({ 'any.only': 'Passwords must match' })
    });
    return schema.validate(obj);

}

//logging in  validation
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}



function validateResetPassword(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        otp: Joi.string().length(6).required(),
        newPassword: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        password: Joi.string().trim().min(8),
    });
    return schema.validate(obj);

}


module.exports = {
    User,
    validateRegisteredUser,
    validateUpdateUser,
    validateLoginUser,
    validateResetPassword,
}
