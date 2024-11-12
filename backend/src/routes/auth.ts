import express, {Router} from 'express';
import {
    createUser,
    loginUser,
    verifyOTP
} from '../controllers/auth.ts';
import {verifyUsername} from "../middleware/verifyUsername.ts";

export const authRoutes:Router = express.Router();

authRoutes.post('/login',loginUser)
authRoutes.post('/signup',createUser)
authRoutes.post('/verify',verifyUsername,verifyOTP)