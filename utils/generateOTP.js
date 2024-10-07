const generateOTP = async ()=>{
    try{
        return (otp = `${Math.floor(1000+Math.random()*9000)}`);

    }catch(error){
        console.error('Error generating OTP:', error);
        throw error;
    }
};
module.exports = generateOTP;