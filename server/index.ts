import express, { NextFunction, Application, Response, Request } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './api/apiRouter';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { User } from './database/index';
// const { auth } = require('express-oauth2-jwt-bearer');
dotenv.config({ path: '../.env' });
// import { auth0config } from './api/authMiddleware';

const app = express();
const PORT = process.env.PORT || 3002;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

// const jwtCheck = auth({
//   audience: 'e-com',
//   issuerBaseURL: 'https://dev-3nurd80vhso7rxtr.us.auth0.com/',
//   tokenSigningAlg: 'RS256',
// });
const init = async () => {
  if (!MONGO_DB_URL)
    throw new Error(
      'Failed to connect to MongoDB. Double-check that MONGO_DB_URL is defined as an environment variable, and that mongod is running.'
    );
  await mongoose.connect(MONGO_DB_URL);
  console.log('connected to MongoDB @', MONGO_DB_URL);

  const msPerDay = 1000 * 60 * 60 * 24;
  setInterval(() => {
    User.purgeInactiveCart();
  }, msPerDay)
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

app.patch('/purge-inactive-cart', async (req, res, next) => {
  try {
    const purgeCart = await User.purgeInactiveCart();
    res.status(204).send('ok');
  } catch (err) {
    next(err);
  }
});

app.use('*', (req, res, next) => {
  res.status(404).send('Route does not exist');
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    console.error(err);
    const validationError = fromZodError(err);
    return res.status(400).send(validationError.message);
  }
  next(err);
});

app.listen(PORT, () => {
  init();
  console.log('Server is listening on port: ' + PORT);
});
