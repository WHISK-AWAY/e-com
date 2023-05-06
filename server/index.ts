import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './api/apiRouter';
import mongoose from 'mongoose';
// const { auth } = require('express-oauth2-jwt-bearer');
dotenv.config({ path: '../.env' });
// import { auth0config } from './api/authMiddleware';

const app = express();
const PORT = process.env.PORT || 3002;

// const jwtCheck = auth({
//   audience: 'e-com',
//   issuerBaseURL: 'https://dev-3nurd80vhso7rxtr.us.auth0.com/',
//   tokenSigningAlg: 'RS256',
// });
const init = async () => {
  await mongoose.connect(process.env.MONGO_DB_URL!);
};

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(auth0config);
app.use('/api', apiRouter);
// app.use(jwtCheck);

// app.get('/authorized', function (req, res) {
//   res.send('Secured Resource');
// });

app.get('/', (req, res, next) => {
  try {
    res.status(200).send('homepage');
  } catch (err) {
    next(err);
  }
});

app.use('*', (req, res, next) => {
  res.status(404).send('Route does not exist');
});

app.listen(PORT, () => {
  init();
  console.log('Server is listening on port: ' + PORT);
});
