import express, {Router} from 'express';
import {
    createUser,
    loginUser,
    getRoles,
    getAllUsers,
    getProfileDetails
} from '../controllers/user.ts';
import {verifyJwt} from "../middleware/verifyJWT.ts";
import {verifyRole} from "../middleware/verifyRole.ts";

export const userRoutes:Router = express.Router();

userRoutes.post('/login',loginUser)
userRoutes.post('/signup',createUser)
userRoutes.get('/roles',verifyJwt,getRoles)
userRoutes.get('/profile',verifyJwt,getProfileDetails);
userRoutes.get('/',verifyJwt,verifyRole(['Admin']),getAllUsers)
userRoutes.post('/',verifyJwt,verifyRole(['Admin']),createUser)