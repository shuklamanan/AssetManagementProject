import pg from  'pg'
import dotenv from 'dotenv'
let Client = pg.Client;
dotenv.config()
const client = new Client({
    connectionString: process.env.DATABASE_URL, // Use environment variable for security
    ssl: { rejectUnauthorized: false }, // Required for Neon
    // user:process.env.POSTGRES_USER ??"",
    // database: process.env.POSTGRES_DATABASE??"",
    // password: process.env.POSTGRES_PASSWORD??"",
    // port: Number(process.env.POSTGRES_PORT)??5432,
    // host: process.env.POSTGRES_DOCKER_HOST??"localhost"
})
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("connected db successfully.");
    } catch (error:any) {
        console.log(error.message);
    }
}

connectToDatabase();
export default client;