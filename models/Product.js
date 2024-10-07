const mongoose = require('mongoose');
const Joi = require('joi');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 1,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountedPrice: {
        type: Number,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images:[ {
        type: Object,
        default: {
            url: "",
            publicId: null
        }
    }],
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    soldCount: {    // New field to track how many times this product has been sold
        type: Number,
        default: 0
    },
}, {
    timestamps: true,
});

ProductSchema.pre('save', function (next) {
    if (this.discount > 0) {
        this.discountedPrice = this.price - (this.price * this.discount / 100);
    } else {
        this.discountedPrice = this.price;
    }
    next();
});

const Product = mongoose.model('Product', ProductSchema);

function validateCreateProduct(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200).required(),
        description: Joi.string().trim().min(10).required(),
        price: Joi.number().min(1).required(),
        discount: Joi.number().min(0).max(100),
        category: Joi.string().required(),
        images: Joi.array().items(Joi.object({
            url: Joi.string().uri().required(),
            publicId: Joi.string().allow(null)
        })),
        stock: Joi.number().integer().min(0).required(),
    });
    return schema.validate(obj);
}

function validateUpdateProduct(obj) {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(200).required(),
        description: Joi.string().trim().min(10).required(),
        price: Joi.number().min(1).required(),
        discount: Joi.number().min(0).max(100),
        category: Joi.string().required(),
        images: Joi.array().items(Joi.object({
            url: Joi.string().uri().required(),
            publicId: Joi.string().allow(null)
        }))
    });
    return schema.validate(obj);
}

module.exports = {
    Product,
    validateCreateProduct,
    validateUpdateProduct,
};
