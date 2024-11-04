import express, {Router} from 'express';

import {
    createUser,
    loginUser,
    getRoles
} from '../controllers/user.ts';

import {verifyJwt} from "../middleware/varifyJWT";
export const userRoutes:Router = express.Router();

userRoutes.post('/login',loginUser)
userRoutes.post('/signup',createUser)
userRoutes.get('/roles',verifyJwt,getRoles)

