import express from 'express';
import cors from 'cors';
import multer from 'multer';
import postRoutes from './routes/posts';

const app = express();
const port = 3030;

// For parsing application/ json
app.use(express.json({ limit: '30mb' }));
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ limit: '30mb', extended: true }));

app.use(cors());

// Create routes
app.use('/post', postRoutes);

// Test routes
app.get('/test/', (req, res) => {
    res.status(200).send('Hello World Test');
});

app.listen(port);
