import {createClient} from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const redisClient = createClient({
    url: process.env.REDIS_URL!!,
});

async function connectToDatabase() {
    try {
        await redisClient.connect();
        console.log("redis connected successfully.");
    } catch (error: any) {
        console.log(error.message);
    }
}

connectToDatabase();
export default redisClient;