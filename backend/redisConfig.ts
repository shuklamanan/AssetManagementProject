import {createClient} from 'redis';
import dotenv from 'dotenv'

dotenv.config()

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

async function connectToDatabase() {
    try {
        await redisClient.connect();
        console.log("connected db successfully.");
    } catch (error: any) {
        console.log(error.message);
    }
}

connectToDatabase();
export default redisClient;