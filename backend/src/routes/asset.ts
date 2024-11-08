import express, {Router} from 'express';
import {verifyJwt} from "../middleware/verifyJWT.ts";
import {
    createAssets,
    getAllAssets,
    updateAsset,
    assetAssign,getAssetHistory, assetUnassign,deleteAsset
} from '../controllers/asset.ts';
import {verifyRole} from "../middleware/verifyRole.ts";

export const assetRoutes:Router = express.Router();
assetRoutes.use(verifyJwt)
assetRoutes.get('/',getAllAssets)
assetRoutes.post('/',verifyRole(['Admin']),createAssets)
assetRoutes.get('/history',verifyRole(['Admin']),getAssetHistory)
assetRoutes.post('/assign',verifyRole(['Admin']),assetAssign)
assetRoutes.post('/unassign/:id',verifyRole(['Admin']),assetUnassign)
assetRoutes.put('/:id',verifyRole(['Admin']),updateAsset)
assetRoutes.delete('/:id',verifyRole(['Admin']),deleteAsset)
