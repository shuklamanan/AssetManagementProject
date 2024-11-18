import express, {Router} from 'express';
import {verifyJwt} from "../middleware/verifyJWT";
import {verifyRole} from "../middleware/verifyRole";
import {createMessage} from "../controllers/message";

export const messageRoutes:Router = express.Router();
messageRoutes.use(verifyJwt)
// messageRoutes.get('/',getAllMessages)
messageRoutes.post('/',verifyRole(['Admin']),createMessage)