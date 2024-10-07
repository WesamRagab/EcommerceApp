const router = require('express').Router();
const { createProductCtrl, getAllProductsCtrl, getSingleProductCtrl, updateProductCtrl, getBestSellersCtrl, updateProductPhotosCtrl } = require('../controllers/productsControllers');
const PhotoUpload = require('../middlewares/photoUpload');
const { verifyToken } = require('../middlewares/verifyToken');
// const validateObject = require('../middlewares/validateObjectId');

router.route('/')
    .post(verifyToken, PhotoUpload.array('images', 5), createProductCtrl)
    .get(verifyToken, getAllProductsCtrl);

router.route('/best-sellers').get(verifyToken, getBestSellersCtrl);

router.route('/:id').get(verifyToken, getSingleProductCtrl)
    .put(verifyToken, updateProductCtrl)

router.route('/:id/images').get(verifyToken, getSingleProductCtrl)
    .put(verifyToken,PhotoUpload.array('images', 5) ,updateProductPhotosCtrl);

module.exports = router;