import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import {createClient} from 'redis'
dotenv.config();
connectDB();

export const redisClient = createClient({
    url: process.env.REDIS_URI as string,
});
redisClient.connect()
.then(() => console.log('Redis client connected'))
.catch(console.error);

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});