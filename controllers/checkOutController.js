const { Checkout, validateCheckout } = require('../models/checkOut');
const { Cart } = require('../models/Cart');
const { Product } = require('../models/Product');
const asyncHandler = require('express-async-handler');

// Create Checkout Controller
module.exports.createCheckout = asyncHandler(async (req, res) => {
    // const userId = req.user.id;

    // try {
    //     //  Fetch user's cart
    //     const cartItems = await Cart.find({ userId }).populate('product.productId');

    //     if (!cartItems.length) {
    //         return res.status(400).json({ message: "Cart is empty" });
    //     }

    //     //  Validate cart items and calculate total price
    //     const carts = [];
    //     let totalPrice = 0;

    //     for (const item of cartItems) {
    //         const product = item.product.productId;

    //         // Check if the product exists and is in stock
    //         if (!product || product.stock < item.product.quantity) {
    //             return res.status(400).json({ message: `Product ${product.title} is sold out or doesn't exist` });
    //         }


    //         // Calculate total price for this item
    //         const itemPrice = product.discountedPrice * item.product.quantity;
    //         totalPrice += itemPrice;

    //         // Add to carts list
    //         carts.push({
    //             productId: product._id,
    //             title: product.title,
    //             quantity: item.product.quantity,
    //             price: product.discountedPrice // Use discounted price if applicable
    //         });
    //     }

    //     console.log(carts)
    //     //  Create checkout entry
    //     const checkoutData = {
    //         userId,
    //         carts,
    //         totalPrice,
    //     };

    //     console.log("1");

    //     // Validate checkout data
    //     const { error } = validateCheckout(checkoutData);
    //     if (error) {
    //         return res.status(400).json({ message: error.details[0].message });
    //     }
    //     console.log("lfglks")

    //     const checkout = new Checkout(checkoutData);
    //     await checkout.save();

    //     //  Clear the cart after checkout
    //     await Cart.deleteMany({ userId });

    //     return res.status(201).json({ message: "Checkout created successfully", checkout });
    // } catch (err) {
    //     console.error(err);
    //     return res.status(500).json({ message: "Internal server error" });
    // }
    const userId = req.user.id;

    try {
        // Fetch all cart items for the user
        const cartItems = await Cart.find({ userId }).populate('product.productId');

        if (!cartItems.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const carts = [];
        let totalPrice = 0;

        // Loop over all cart items
        for (const item of cartItems) {
            const product = item.product.productId;

            // Check if the product exists and is in stock
            if (!product || product.stock < item.product.quantity) {
                return res.status(400).json({ message: `Product ${product.title} is sold out or doesn't exist` });
            }

            // Calculate the price for each item in the cart
            const itemPrice = product.discountedPrice * item.product.quantity;
            totalPrice += itemPrice;

            // Add product details to the checkout carts list
            carts.push({
                productId: product._id,
                title: product.title,
                quantity: item.product.quantity,
                price: product.discountedPrice // Use discounted price if applicable
            });
             // Update stock and sold count
             product.stock -= item.product.quantity;
             product.soldCount += item.product.quantity;
 
             // Save product updates
             await product.save();
        }

        // Create checkout data with total price and all carts
        const checkoutData = {
            userId,
            carts,
            totalPrice,
        };

        // Validate checkout data
        const { error } = validateCheckout(checkoutData);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Create checkout entry
        const checkout = new Checkout(checkoutData);
        await checkout.save();

        // Clear the cart after checkout
        await Cart.deleteMany({ userId });

        return res.status(201).json({ message: "Checkout created successfully", checkout });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }

});

