const router = require('express').Router();
const { createCheckout } = require('../controllers/checkOutController');
const { verifyTokenAndAuthorization } = require('../middlewares/verifyToken'); // Assuming you have authentication middleware


router.post('/', verifyTokenAndAuthorization,createCheckout );  

module.exports = router;
