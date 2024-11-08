import express, {Router} from 'express';
import {
    getRoles,
    getAllUsers,
    getProfileDetails,
    deleteUser,
    createUserViaAdmin
} from '../controllers/user.ts';
import {verifyJwt} from "../middleware/verifyJWT.ts";
import {verifyRole} from "../middleware/verifyRole.ts";

export const userRoutes:Router = express.Router();
userRoutes.use(verifyJwt)
userRoutes.get('/roles',getRoles)
userRoutes.get('/profile',getProfileDetails);
userRoutes.get('/',verifyRole(['Admin']),getAllUsers)
userRoutes.post('/',verifyRole(['Admin']),createUserViaAdmin)
userRoutes.delete('/:id',verifyRole(['Admin']),deleteUser)