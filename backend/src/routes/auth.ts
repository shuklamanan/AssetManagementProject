import express, {Router} from 'express';
import {
    createUser,
    loginUser
} from '../controllers/auth.ts';

export const authRoutes:Router = express.Router();

authRoutes.post('/login',loginUser)
authRoutes.post('/signup',createUser)