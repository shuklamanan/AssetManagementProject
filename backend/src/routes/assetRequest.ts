import express, {Router} from 'express';
import {verifyJwt} from "../middleware/verifyJWT.ts";
import {
createAssetRequest,getAllPendingRequests,updateRequestStatus
} from '../controllers/assetRequest.ts';
import {verifyRole} from "../middleware/verifyRole.ts";

export const assetRequestRoutes:Router = express.Router();
assetRequestRoutes.use(verifyJwt)
assetRequestRoutes.post('/',createAssetRequest)
assetRequestRoutes.get('/',verifyRole(['Admin']),getAllPendingRequests)
assetRequestRoutes.post('/status',verifyRole(['Admin']),updateRequestStatus)


