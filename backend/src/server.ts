import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import {userRoutes} from './routes/user.ts';
import {assetRoutes} from './routes/asset.ts';
import {authRoutes} from './routes/auth.ts';
import {assetRequestRoutes} from "./routes/assetRequest.ts";
//TODO interface.ts refactor
// make seprate folder for database query functions basically seprate them from controllers
// we can do something about try catch that we dont have to write it manually each time
// make seprate queue structure and add jobs for email notifications use rabbitmq
// dont send back jwt token with username to the frontend when forgot password
// not even in create user
// maybe use redis for caching layer as well use another db for storing just these temparory users as well
dotenv.config()
const app = express();
app.use(cors());
app.use(express.json());

app.use('/users', authRoutes);
app.use('/users', userRoutes);
app.use('/assets',assetRoutes);
app.use('/assets/request',assetRequestRoutes)
const port = process.env.BACKEND_PORT || 5000
app.listen(port, () =>
    console.log(`Server is live @ `+port)
);