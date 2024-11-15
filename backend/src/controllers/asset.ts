import client from "../../postgresConfig.ts"
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

const assetAssignSubject: string = "Assignment Of Assets";
const assetUnassignSubject: string = "Unassignment Of Assets";
const assetUpdationSubject: string = "Update Assets";

export const createAssets = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            name,
            assetType,
            config,
            userId
        } = req.body as ICreateAssetQueryBody;
        if (!(name && assetType && config)) {
            res.status(400).json({message: "some required fields are missing in req"})
            return;
        }
        const response: IAsset = await client.query("insert into assets(name, asset_type, config,user_id) values ($1,$2,$3,$4) returning *", [name, assetType, JSON.stringify(config), userId ?? null])
        if (userId) {
            await publishAssetNotification({
                sub: assetAssignSubject,
                title: "Following Asset is assigned to You",
                assetId: response.rows[0].id,
                userId: userId
            })
            await client.query("INSERT INTO asset_history (asset_id,user_id,assigned_by,assigned_at) VALUES ($1,$2,$3,now())", [response?.rows[0].id, userId, req.body.user.id]);
        }
        res.status(201).json({message: "asset created successfully"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const getAllAssets = async (req: Request, res: Response): Promise<void> => {
    try {
        let response: IMergeDetailsOfAssetAndUser[];
        if (req.body.user.role.includes('Admin')) {
            response = (await client.query(`SELECT a.id,
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
            `)).rows;
        } else {
            response = (await client.query(`SELECT a.id,
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
            `, [req.body.user.id])).rows;
        }
        const allAssets = response.map(asset => new Asset(asset));
        res.status(200).json(allAssets ?? []);
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const {
            name,
            assetType,
            config,
            userId,
        } = req.body as ICreateAssetQueryBody;
        await client.query("UPDATE assets SET name = $1 , asset_type = $2, config = $3, user_id=$4 WHERE id=$5 AND archived_at IS NULL", [name, assetType, JSON.stringify(config), userId ?? null, id])
        if (userId) {
            await publishAssetNotification({
                sub: assetUpdationSubject,
                title:"your asset details are updated by admin here is updated details",
                assetId: id,
                userId: userId
            })
        }
        res.status(200).json({message: "asset updated successfully"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const assetAssign = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body.userId || !req.body.assetId) {
            res.status(400).send({error: "Please enter all required fields"});
            return;
        }
        let {userId, assetId}: { userId: number, assetId: number } = req.body
        const assetDeletedOrNot: number = (await client.query("SELECT 1 AS asset_deleted_or_not FROM assets WHERE id=$1 AND archived_at IS NOT NULL", [assetId])).rows.length;
        const userDeletedOrNot: number = (await client.query("SELECT 1 AS user_deleted_or_not FROM users WHERE id=$1 AND archived_at IS NOT NULL", [userId])).rows.length;
        if (assetDeletedOrNot) {
            res.status(400).json({"message": "You can not assign asset because This asset is deleted"});
            return;
        }
        if (userDeletedOrNot) {
            res.status(400).json({"message": "You can not assign asset to this user because This user is deleted"});
            return;
        }
        const response: number = (await client.query("SELECT 1 AS asset_holder_or_not FROM assets WHERE id=$1 AND user_id IS NOT NULL", [assetId])).rows.length;
        if (!response) {
            await client.query("UPDATE asset_requests SET status = 'Disapproved' WHERE status='Pending' and asset_id=$1", [assetId]);
            await client.query("UPDATE assets SET user_id = $1 WHERE id = $2", [userId, assetId]);
            await client.query("INSERT INTO asset_history (asset_id,user_id,assigned_by,assigned_at) VALUES ($1,$2,$3,now())", [assetId, userId, req.body.user.id]);
            await publishAssetNotification({
                sub: assetAssignSubject,
                title: "Following Asset is assigned to You",
                assetId: assetId,
                userId: userId
            })
            res.status(201).json({"message": "successfully assigning user"});
            return;
        }
        res.status(201).json({"message": "Asset has been already assigned to someone"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const assetUnassign = async (req: Request, res: Response): Promise<void> => {
    try {
        const assetId = req.params.id
        if (!assetId) {
            res.status(400).send({error: "Please enter all required fields"});
            return;
        }
        const response: {
            user_id: number
        }[] = (await client.query("SELECT user_id FROM assets WHERE user_id IS NOT NULL AND id=$1", [assetId])).rows
        if (response.length == 0) {
            res.status(400).json({message: "Asset is already unassigned"});
            return;
        }
        const userId = response[0].user_id
        await publishAssetNotification({
            sub: assetUnassignSubject,
            title: "Following Assets are Unassigned From You by Admin",
            assetId: assetId,
            userId: userId
        })
        await client.query("UPDATE asset_history SET unassigned_at = now(),assigned_by = $3 WHERE asset_id=$1 AND user_id=$2 AND unassigned_at IS NULL", [assetId, response[0].user_id, req.body.user.id]);
        await client.query("UPDATE assets SET user_id = null WHERE id=$1", [assetId]);
        res.status(201).json({"message": "successfully unassigning asset"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}
export const getAssetHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const assetsHistory: IMergeDetailsOfAssetAndUserAndAssetHistory[] = (await client.query("SELECT ah.user_id, u.username,a.id as asset_id,a.name as asset_name,ah.assigned_at,ah.unassigned_at FROM asset_history ah LEFT JOIN users u  ON u.id = ah.user_id JOIN assets a ON ah.asset_id = a.id  ORDER BY ah.id")).rows
        const viewAssetsHistory = assetsHistory.map((assetHistory) => new AssetHistory(assetHistory))
        res.status(200).json(viewAssetsHistory);
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const deleteAsset = async (req: Request, res: Response): Promise<void> => {
    try {
        let assetId: string = req.params.id
        const response = await client.query("select user_id from assets where user_id is not null and id=$1", [assetId])
        if (response.rows.length > 0) {
            const userId = response.rows[0].user_id
            await publishAssetNotification({
                sub: assetUnassignSubject,
                title: "Following Assets are Unassigned From You by Admin",
                assetId: assetId,
                userId: userId
            })
        }
        await client.query("update asset_requests set status='Disapproved' where status='Pending' and asset_id=$1", [assetId])
        await client.query("update asset_history set unassigned_at = $1 where asset_id = $2 and unassigned_at is null", [new Date(), assetId])
        await client.query("update assets set user_id=null , archived_at = $1 where id = $2", [new Date(), assetId])
        res.status(200).json({message: "asset deleted successfully"})
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};
