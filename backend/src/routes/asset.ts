import express, {Router} from 'express';
import {verifyJwt} from "../middleware/verifyJWT.ts";
import {
    createAssets,
    getAllAssets,
    updateAsset,
    assetAssign,getAssetHistory, assetUnassign
} from '../controllers/asset.ts';
import {verifyRole} from "../middleware/verifyRole.ts";

export const assetRoutes:Router = express.Router();

assetRoutes.post('/',verifyJwt,verifyRole(['Admin']),createAssets)
assetRoutes.get('/',verifyJwt,getAllAssets)
assetRoutes.get('/history',verifyJwt,verifyRole(['Admin']),getAssetHistory)
assetRoutes.post('/assign',verifyJwt,verifyRole(['Admin']),assetAssign)
assetRoutes.post('/unassign/:id',verifyJwt,verifyRole(['Admin']),assetUnassign)
assetRoutes.put('/:id',verifyJwt,verifyRole(['Admin']),updateAsset)
