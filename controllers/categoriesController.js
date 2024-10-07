const asyncHAndler = require('express-async-handler');
const {Category , validateCreateCategory } = require('../models/Category');



//createCategory controller function

module.exports.createCategoryCtrl = asyncHAndler(async(req, res) => {
    // validation
    const { error } = validateCreateCategory(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // check if category already exists
    const categoryExists = await Category.findOne({ title: req.body.title });
    if (categoryExists) {
        return res.status(400).json({ message: 'Category already exists' });
    }

    // create category
    const category = await Category.create({ 
        title: req.body.title,
        user: req.user.id
    });
    
    res.status(201).json(category );
});

// get all categories controller function

module.exports.getCategoriesCtrl = asyncHAndler(async(req, res) => {
    
    const categories = await Category.find();
    res.json(categories);
});

module.exports.CountCategoriesCtrl = asyncHAndler(async (req, res) => {
    const count = await Category.countDocuments();
    res.status(200).json(count);

});

