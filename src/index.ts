import express from 'express';
import cors from 'cors';
import multer from 'multer';
import postRoutes from './routes/posts';
import { query } from './db/index';

export const app = express();
const port = 3030;

// Initialize middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

// Create routes
app.use('/post', postRoutes);

// Test routes
app.get('/test/', (req, res) => {
    res.status(200).send('Hello World Test');
});

app.listen(port);
