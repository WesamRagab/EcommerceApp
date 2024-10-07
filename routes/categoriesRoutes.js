const router = require('express').Router();
const { createCategoryCtrl, getCategoriesCtrl, deleteCategoriesCtrl, CountCategoriesCtrl } = require('../controllers/categoriesController');
const { verifyTokenAndAdmin, verifyTokenAndAuthorization } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

router.route('/')
    .post(verifyTokenAndAdmin, createCategoryCtrl)
    .get(verifyTokenAndAuthorization, getCategoriesCtrl);

router.route('/count').get(verifyTokenAndAdmin, CountCategoriesCtrl);



/// @ update category

module.exports = router;