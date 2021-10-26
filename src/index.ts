import express from 'express';
import cors from 'cors';
import multer from 'multer';
import postRoutes from './routes/posts';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { query } from './db/index';
import passport from 'passport';

import './auth/auth';

export const app = express();
const port = 3030;

// Initialize middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use(passport.initialize());

// Create routes
app.use('/', authRoutes);
app.use('/post', postRoutes);
app.use('/', userRoutes);

// Test routes
app.get('/test/', (req, res) => {
    res.status(200).send('Hello World Test');
});

app.listen(port);
