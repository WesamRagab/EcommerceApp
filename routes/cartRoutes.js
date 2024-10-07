const router = require('express').Router();
const {verifyTokenAndAuthorization} = require('../middlewares/verifyToken')
const { addToCartCtrl, updateCartItemsCtrl, getCartItemsCtrl, checkout } = require('../controllers/cartController');


// Route to add a product to the cart
router.route('/add').post(verifyTokenAndAuthorization, addToCartCtrl);

// Route to update cart item quantity
router.route('/update/:productId').put( verifyTokenAndAuthorization, updateCartItemsCtrl);

// Route to get all products in the cart
router.route('/').get( verifyTokenAndAuthorization, getCartItemsCtrl)
// router.route('/checkout').get(verifyTokenAndAuthorization , checkout);


module.exports = router;

