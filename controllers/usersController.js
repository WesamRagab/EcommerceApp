const { User, validateUpdateUser } = require('../models/user');
// const validateUpdateUser= require('../models/user');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');


module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

module.exports.CountUsersCtrl = asyncHandler(async (req, res) => {
    const count = await User.countDocuments();
    res.status(200).json(count);

});

module.exports.getUserByIdCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: 'This User is not found' });
    }
    res.status(200).json(user);
});

module.exports.UpdateUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
        res.status(404).json({ message: error.details[0].message });
    }
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
        }
    }, { new: true });
    res.status(200).json(user);

});
