import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/config.js';
import userRoutes from './routes/UserRoute.js';
import productRoutes from './routes/ProductRoute.js';
import personRoutes from './routes/PersonRoute.js';
import orderRoutes from './routes/OrderRoute.js';
import financialRoutes from './routes/FinancialRoute.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './middleware/logger.js';

dotenv.config();
const app = express();
app.use(logger);

app.get("/", (req, res) => {
    res.send("hello world");
})

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/people', personRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/financials', financialRoutes);
app.use(errorHandler);

app.listen(5000 ,() => {
    connectDB();
    console.log("Server is listening on port http://localhost:5000")
});