import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './api/apiRouter';
const { auth } = require('express-oauth2-jwt-bearer');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;


// const jwtCheck = auth({
//   audience: 'e-com',
//   issuerBaseURL: 'https://dev-3nurd80vhso7rxtr.us.auth0.com/',
//   tokenSigningAlg: 'RS256',
// });


app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
  console.log('Server is listening on port: ' + PORT);
});
