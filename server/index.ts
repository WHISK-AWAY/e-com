import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(morgan('dev'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
