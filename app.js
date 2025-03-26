import './instrument.js';
import * as Sentry from "@sentry/node";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import eventRou from './routes/v1/eventroutes.js';
import authRou from './routes/v1/authroutes.js';
import general from './routes/v1/generalroutes.js';
import Booking from './routes/v1/BookingsRoutes.js';
import { StatusCodes} from 'http-status-codes';

console.log("hello")
dotenv.config(); 

const app = express();
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  import('./docs/swagger.js').then(({ default: setupSwagger }) => {
    setupSwagger(app);
  });
}



Sentry.setupExpressErrorHandler(app);


console.log(process.env.NODE_ENV);
console.log(process.env.NODE_ENV);


// Database connection
if (process.env.NODE_ENV!=="test")
    {
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 5000, 
}).then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    Sentry.captureException(err);
});
    }

// Routes
app.use('/auth', authRou);
app.use('/event', eventRou);
app.use('/booking', Booking);
app.use('/general', general);


// Error handling middleware
app.use((err, req, res, next) => {
    Sentry.captureException(err);
    
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
});


// Server setup
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV!=="test"){

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log(`the server listening on port ${PORT}`);
}


export default app