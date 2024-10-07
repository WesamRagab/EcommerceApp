const mongoose = require('mongoose');
const Joi = require('joi');

const CheckoutSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    carts: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },

            title:{String} ,
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

}, {
    timestamps: true
});

// Function to validate checkout creation
function validateCheckout(obj) {
    const schema = Joi.object({
        userId: Joi.string().required(),
        carts: Joi.array().items(
            Joi.object({
                productId: Joi.required(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().required(),
                title: Joi.string().required()
            })
        ).required(),
        totalPrice: Joi.number().required(),
    });
    return schema.validate(obj);
}

const Checkout = mongoose.model('Checkout', CheckoutSchema);

module.exports = {
    Checkout,
    validateCheckout
};
