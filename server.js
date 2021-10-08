const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTIONS');
  console.log(err.name, err.message);
  // console.log(err);
  // server.close(() => {
  //   // Suspending any pending request
  //   process.exit(1); // Shutting server
  // });
});

dotenv.config({ path: './config.env' });

const app = require('./app');
// console.log(app.get('env'));

// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
console.log({DB})

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection successful!');
  });

// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log('ERROR', err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTIONS');
  // console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    // Suspending any pending request
    process.exit(1); // Shutting server
  });
});
// console.log(x);
