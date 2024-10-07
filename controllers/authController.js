const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, validateRegisteredUser, validateLoginUser, validateResetPassword } = require('../models/user');
const nodemailer = require('nodemailer');


module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  //1 validation 
  const { error } = validateRegisteredUser(req.body);
  if (error) {
    //the user Entered the wrong data (bad request 400)
    return res.status(400)
      .json({ msg: error.details[0].message });
  }
  //is the user already registered(exist) checking it in the database
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: " This User Already Registered" })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
}
  //hash the user password  

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  // then add new user and save it to the database
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword
  });
  await user.save();

  //send the response to the user
  res.status(201).json({ message: "Registered Successfully , please Log In", user })

});

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // is the user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).json({ message: "Invalid Email or Password" });
  }
  //check the password
  const isPassword = await bcrypt.compare(req.body.password, user.password);

  if (!isPassword) {
    res.status(400).json({ message: "Invalid Password " });
  }

  // generate token 
  const token = user.generateAuthToken();

  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    token,
  });


});

module.exports.forgetPassword = asyncHandler(async (req, res) => {

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "User not found please register" });
    }
       // Generate a 6-digit OTP
       const otp = crypto.randomInt(100000, 999999).toString();
       const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
   
       // Store OTP and expiry in the user's record
       user.resetPasswordOTP = otp;
       user.otpExpires = otpExpires;
       await user.save();
   
       // Send OTP to the user's email
       const transporter = nodemailer.createTransport({
           service: 'gmail',
           auth: {
               user: process.env.MY_GMAIL,
               pass: process.env.MY_PASSWORD,
           },
       });
   
       const mailOptions = {
           from: process.env.MY_GMAIL,
           to: email,
           subject: 'Password Reset OTP',
           text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
       };
   
       await transporter.sendMail(mailOptions);
   
       res.status(200).send({ message: 'OTP sent to email' });

  } catch (error) {
    return res.status(500).send({ message: "Something went wrong", error: error });
  }

});

module.exports.resetPassword = asyncHandler(async (req, res) => {

  try {
    const { error } = validateResetPassword(req.body);
    if (error) {
      //the user Entered the wrong data (bad request 400)
      return res.status(400)
        .json({ msg: error.details[0].message });
    }

    const { email, otp, newPassword } = req.body;
  

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.resetPasswordOTP !== otp || Date.now() > user.otpExpires) {
        return res.status(400).send({ message: 'Invalid or expired OTP' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    
     // Clear the OTP and expiration after successful password reset
     user.resetPasswordOTP = undefined;
     user.otpExpires = undefined;
 
     await user.save();
     res.status(200).send({ message: 'Password successfully reset' });
    

  } catch (error) {
    return res.status(500).send({ message: "Something went wrong", error: error });
  }

});



module.exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send({ message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp) {
        return res.status(400).send({ message: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpires) {
        return res.status(400).send({ message: 'OTP has expired' });
    }

    res.status(200).send({ message: 'OTP verified successfully' });
});


