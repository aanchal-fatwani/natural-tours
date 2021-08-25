const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); // Validations on strings only

const tourSchema = new mongoose.Schema(
  {
    // name:String,
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [10, 'A tour must have more than or equal to 10'],
      maxlength: [40, 'A tour must have less than or equal to 40'],
      // validate: [validator.isAlpha, 'A tour must be alpha'],
    },
    rating: { type: Number, default: 4.5 },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Only easy medium difficult allowed',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be less than or equal to 5'],
      min: [1, 'Rating must be more than or equal to 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, 'Tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' only points to current doc on NEW document creation, not for UPDATE
          return val < this.price;
        },
        message: "Discount can't be more than price ({VALUE})",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    slug: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //(to hide)
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() - 'this' points to current document
// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });
// tourSchema.pre('save', (next) => {
//   console.log('Will save doc..');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   next();
// });

// QUERY MIDDLEWARE - 'this' points to query object
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //this keyword here refers to doc queried upon; we can add custom fields
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

// AGGREGATE MIDDLEWARE - 'this' points to aggregate object
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
