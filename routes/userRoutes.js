const { getAllUsersCtrl, CountUsersCtrl, UpdateUserCtrl, getUserByIdCtrl } = require('../controllers/usersController');
// const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken ,verifyTokenAndAuthorization } = require('../middlewares/verifyToken');
const validateObject = require('../middlewares/validateObjectId');
const router = require('express').Router();


router.route('/').get(getAllUsersCtrl);

router.route("/count").get(CountUsersCtrl);

router.route("/:id")
    .get(validateObject, getUserByIdCtrl)
    .put(validateObject, UpdateUserCtrl);

module.exports = router;
