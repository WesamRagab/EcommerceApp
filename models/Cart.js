const mongoose = require('mongoose');
const Joi = require('joi');

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', CartSchema);

// validateCreateCart
function validateCreateCart(obj) {
    const schema = Joi.object({
        userId: Joi.string().required(),
        product: Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required()
        }).required()
    });
    return schema.validate(obj);
}

// validateUpdateCart
function validateUpdateCart(obj) {
    const schema = Joi.object({
        userId: Joi.string(),
        product: Joi.object({
            productId: Joi.string().required(),
            quantity: Joi.number().integer().min(1).required()
        }).required()
    });
    return schema.validate(obj);
}

module.exports = {
    Cart,
    validateCreateCart,
    validateUpdateCart 
};
