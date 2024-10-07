const router = require('express').Router();
const { registerUserCtrl , loginUserCtrl, forgetPassword, resetPassword, verifyOTP } = require('../controllers/authController');

 // /api/auth/register
 router.post('/register', registerUserCtrl );
 router.post('/login', loginUserCtrl );
 router.post('/forget-password', forgetPassword );
 router.post('/verify-otp', verifyOTP);
 router.post("/reset-password", resetPassword);



module.exports = router;