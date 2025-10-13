import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import {createClient} from 'redis'
import  userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
dotenv.config();
connectDB();
connectRabbitMQ();
export const redisClient = createClient({
    url: process.env.REDIS_URI as string,
});
redisClient.connect()
.then(() => console.log('Redis client connected'))
.catch(console.error);

const app = express();
app.use(express.json());
app.use("/api/v1",userRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});