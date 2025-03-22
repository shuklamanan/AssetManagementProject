import {Request, Response} from "express";
import {
    IAsset,
    ICreateAssetQueryBody,
    IMergeDetailsOfAssetAndUser,
    IMergeDetailsOfAssetAndUserAndAssetHistory,
} from "../interfaces.ts";
import {Asset} from "../viewModels/assets.ts";
import {AssetHistory} from "../viewModels/assetHistory.ts";
import {publishAssetNotification} from "../publishers/mailAsset.ts";
import {executeQuery, handleError, handleSuccess} from "../functions/requestResponse.ts";
import {exec} from "node:child_process";

const assetAssignSubject: string = "Assignment Of Assets";
const assetUnassignSubject: string = "Unassignment Of Assets";
const assetUpdationSubject: string = "Update Assets";

export const createAssets = async (req: Request, res: Response): Promise<void> => {
    const {
        name,
        assetType,
        config,
        userId
    } = req.body as ICreateAssetQueryBody;
    if (!(name && assetType && config)) {
        console.log(name,assetType,config)
        handleError(res,400,"some required fields are missing in request")
        return;
    }
    const response: IAsset = await executeQuery("insert into assets(name, asset_type, config,user_id) values ($1,$2,$3,$4) returning *", [name, assetType, JSON.stringify(config), userId ?? null],res)
    if (userId) {
        await publishAssetNotification({
            sub: assetAssignSubject,
            title: "Following Asset is assigned to You",
            assetId: response.rows[0].id,
            userId: userId
        })
        await executeQuery("INSERT INTO asset_history (asset_id,user_id,assigned_by,assigned_at) VALUES ($1,$2,$3,now())", [response?.rows[0].id, userId, req.body.user.id],res);
    }
    handleSuccess(res,201,"Asset created successfully")
}

export const getAllAssets = async (req: Request, res: Response): Promise<void> => {
    let response: IMergeDetailsOfAssetAndUser[];
    if (req.body.user.role.includes('Admin')) {
        response = (await executeQuery(`SELECT a.id,
                                               a.name,
                                               a.asset_type,
                                               a.user_id,
                                               a.config,
                                               u.username,
                                               u.first_name,
                                               u.last_name,
                                               u.email,
                                               u.phone_number
                                            FROM assets a
                                            LEFT JOIN users u ON u.id = a.user_id
                                            WHERE a.archived_at IS NULL
                                            AND u.archived_at IS NULL
                                            ORDER BY a.id
        `,[],res)).rows;
    } else {
        response = (await executeQuery(`SELECT a.id,
                                               a.name,
                                               a.asset_type,
                                               a.user_id,
                                               a.config,
                                               u.username,
                                               u.first_name,
                                               u.last_name,
                                               u.email,
                                               u.phone_number
                                            FROM assets a
                                            LEFT JOIN users u ON u.id = a.user_id
                                            WHERE a.archived_at IS NULL
                                            AND u.archived_at IS NULL
                                            AND (u.id = $1 OR a.user_id IS NULL)
                                            ORDER BY a.id
        `, [req.body.user.id],res)).rows;
    }
    const allAssets = response.map(asset => new Asset(asset));
    handleSuccess(res,200,'',allAssets ?? []);
}

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id;
    const {
        name,
        assetType,
        config,
        userId,
    } = req.body as ICreateAssetQueryBody;
    await executeQuery("UPDATE assets SET name = $1 , asset_type = $2, config = $3, user_id=$4 WHERE id=$5 AND archived_at IS NULL", [name, assetType, JSON.stringify(config), userId ?? null, id],res)
    if (userId) {
        await publishAssetNotification({
            sub: assetUpdationSubject,
            title:"your asset details are updated by admin here is updated details",
            assetId: id,
            userId: userId
        })
    }
    handleSuccess(res,200,"asset updated successfully")
}

export const assetAssign = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.userId || !req.body.assetId) {
        handleError(res,400,"please enter all required fields")
        return;
    }
    let {userId, assetId}: { userId: number, assetId: number } = req.body
    const assetDeletedOrNot: number = (await executeQuery("SELECT 1 AS asset_deleted_or_not FROM assets WHERE id=$1 AND archived_at IS NOT NULL", [assetId],res)).rows.length;
    const userDeletedOrNot: number = (await executeQuery("SELECT 1 AS user_deleted_or_not FROM users WHERE id=$1 AND archived_at IS NOT NULL", [userId],res)).rows.length;
    if (assetDeletedOrNot || userDeletedOrNot) {
        handleError(res,400,(assetDeletedOrNot) ? "You can not assign asset because This asset is deleted" : "You can not assign asset to this user because This user is deleted")
        return;
    }
    const response: number = (await executeQuery("SELECT 1 AS asset_holder_or_not FROM assets WHERE id=$1 AND user_id IS NOT NULL", [assetId],res)).rows.length;
    if (!response) {
        await executeQuery("UPDATE asset_requests SET status = 'Disapproved' WHERE status='Pending' and asset_id=$1", [assetId],res);
        await executeQuery("UPDATE assets SET user_id = $1 WHERE id = $2", [userId, assetId],res);
        await executeQuery("INSERT INTO asset_history (asset_id,user_id,assigned_by,assigned_at) VALUES ($1,$2,$3,now())", [assetId, userId, req.body.user.id],res);
        await publishAssetNotification({
            sub: assetAssignSubject,
            title: "Following Asset is assigned to You",
            assetId: assetId,
            userId: userId
        })
        handleSuccess(res,201,"successfully assigning user")
        return;
    }
    handleSuccess(res,201,"asset has been already assigned to someone")
}

export const assetUnassign = async (req: Request, res: Response): Promise<void> => {
    const assetId = req.params.id
    if (!assetId) {
        handleError(res,400,"please enter all required fields")
        return;
    }
    const response: { user_id: number }[] = (await executeQuery("SELECT user_id FROM assets WHERE user_id IS NOT NULL AND id=$1", [assetId],res)).rows
    if (!response.length) {
        handleError(res,400,"asset is already unassigned")
        return;
    }
    const userId:number = response[0].user_id
    await publishAssetNotification({
        sub: assetUnassignSubject,
        title: "Following Assets are Unassigned From You by Admin",
        assetId: assetId,
        userId: userId
    })
    await executeQuery("UPDATE asset_history SET unassigned_at = now(),assigned_by = $3 WHERE asset_id=$1 AND user_id=$2 AND unassigned_at IS NULL", [assetId,
        response[0].user_id, req.body.user.id],res);
    await executeQuery("UPDATE assets SET user_id = null WHERE id=$1", [assetId],res);
    handleSuccess(res,201,"successfully unassigning asset")
}

export const getAssetHistory = async (req: Request, res: Response): Promise<void> => {
    const assetsHistory: IMergeDetailsOfAssetAndUserAndAssetHistory[] = (await executeQuery("SELECT ah.user_id, u.username,a.id as asset_id,a.name as asset_name,ah.assigned_at,ah.unassigned_at FROM asset_history ah LEFT JOIN users u  ON u.id = ah.user_id JOIN assets a ON ah.asset_id = a.id  ORDER BY ah.id",[],res)).rows
    const viewAssetsHistory = assetsHistory.map((assetHistory) => new AssetHistory(assetHistory))
    handleSuccess(res,200,'',viewAssetsHistory)
}

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
    let assetId: string = req.params.id
    const response = await executeQuery("select user_id from assets where user_id is not null and id=$1", [assetId],res)
    if (response.rows.length > 0) {
        const userId = response.rows[0].user_id
        await publishAssetNotification({
            sub: assetUnassignSubject,
            title: "Following Assets are Unassigned From You by Admin",
            assetId: assetId,
            userId: userId
        })
    }
    await executeQuery("update asset_requests set status='Disapproved' where status='Pending' and asset_id=$1", [assetId],res)
    await executeQuery("update asset_history set unassigned_at = $1 where asset_id = $2 and unassigned_at is null", [new Date(), assetId],res)
    await executeQuery("update assets set user_id=null , archived_at = $1 where id = $2", [new Date(), assetId],res)
    handleSuccess(res,200,'asset deleted successfully')
};
