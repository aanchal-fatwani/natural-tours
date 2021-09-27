const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const {
//   getAllTours,
//   createTour,
//   getTourById,
//   updateTour,
//   deleteTour,
// } = require('../controllers/tourController');

const router = express.Router();

// router.param('id', tourController.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours); //Aliasing a route which is most usedw

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  // .post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin'),tourController.deleteTour);

module.exports = router;
