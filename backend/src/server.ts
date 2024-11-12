import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import {userRoutes} from './routes/user.ts';
import {assetRoutes} from './routes/asset.ts';
import {authRoutes} from './routes/auth.ts';
import {assetRequestRoutes} from "./routes/assetRequest.ts";
//TODO interface.ts refactor
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