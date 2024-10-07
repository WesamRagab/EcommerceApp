const { Cart, validateCreateCart } = require('../models/Cart');
const { Product } = require('../models/Product');
const asyncHandler = require('express-async-handler');

// Add product to cart
module.exports.addToCartCtrl = asyncHandler(async (req, res) => {
    // const { error } = validateCreateCart(req.body);
    // if (error) return res.status(400).json({ message: error.details[0].message });

    // // Find or create the cart
    // let cart = await Cart.findOne({ userId: req.user.id });
    // if (!cart) {
    //     cart = new Cart({ userId: req.user.id, product: req.body.product });
    // } else {
    //     // Update the product's quantity and price if cart exists
    //     const product = await Product.findById(req.body.product.productId);
    //     if (!product) return res.status(404).json({ message: `Product with id ${req.body.product.productId} not found` });

    //     cart.product = {
    //         productId: req.body.product.productId,
    //         quantity: req.body.product.quantity,
    //     };
    // }
    // // Save the updated cart
    // await cart.save();

    // // Re-fetch the cart with populated product details
    // const updatedCart = await Cart.findOne({ userId: req.user.id }).populate('product.productId');

    // res.status(201).json(updatedCart);
    const { error } = validateCreateCart(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Create a new cart entry for each product added
    const cart = new Cart({
        userId: req.user.id,
        product: req.body.product
    });

    await cart.save();

    // Return the updated cart
    res.status(201).json(cart);
});


module.exports.updateCartItemsCtrl = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (cart.product.productId.toString() === productId) {
        cart.product.quantity = quantity;
        await cart.save();
        res.status(200).json(cart);
    } else {
        res.status(404).json({ message: 'Product not found in the cart' });
    }
});


module.exports.getCartItemsCtrl = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('product.productId');
    if (!cart) return res.status(404).json({ message: 'Cart is empty' });

    res.status(200).json({
        product: {
            product: cart.product.productId,
            quantity: cart.product.quantity,
        }
    });
});

