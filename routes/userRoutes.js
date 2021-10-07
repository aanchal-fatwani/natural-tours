const express = require('express');

const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  getUser,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); // instead of using authcontroller protect on each route

router.patch(
  '/updateMyPassword',
  // authController.protect,
  authController.updatePassword
);
router.get(
  '/me',
  // authController.protect,
  getMe,
  getUser
);
router.patch(
  '/updateMe',
  // authController.protect,
  uploadUserPhoto,
  resizeUserPhoto,
  updateMe
);
router.delete(
  '/deleteMe',
  // authController.protect,
  deleteMe
);

router.use(authController.restrictTo('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
