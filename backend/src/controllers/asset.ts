import client from "../../postgresConfig.ts"
import {Request, Response} from "express";
import {
    IAsset, IAssetAndUserDetails,
    ICreateAssetQueryBody,
    IMergeDetailsOfAssetAndUser,
    IMergeDetailsOfAssetAndUserAndAssetHistory,
} from "../interfaces.ts";
import {Asset} from "../viewModels/assets.ts";
import {AssetHistory} from "../viewModels/assetHistory.ts";
import sendMailForAssetAssignment from "../functions/assetAssign.ts";
import sendMailForAssetUnassignment from "../functions/assetUnassign.ts";
import sendMailForAssetUpdate from "../functions/assetUpdate.ts";

const assetAssignSubject:string = "Assignment Of Assets";
const assetUnassignSubject:string = "Unassignment Of Assets";
const assetUpdationSubject:string = "Update Assets";

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
        const response: IAsset = await client.query("insert into assets(name, asset_type, config,user_id) values ($1,$2,$3,$4) RETURNING *", [name, assetType, JSON.stringify(config), userId ?? null])
        if (userId) {
            const userEmail:string = (await client.query('SELECT email FROM users WHERE id=$1',[userId])).rows[0].email;
            await sendMailForAssetAssignment(userEmail,assetAssignSubject,response);
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
        if(req.body.user.role.includes('Admin')) {
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
        }
        else{
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
            `,[req.body.user.id])).rows;
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
        if(userId){
            const userEmail:string = (await client.query('SELECT email FROM users WHERE id=$1',[userId])).rows[0].email;
            const assetName:IAsset = await client.query('SELECT * FROM assets WHERE id=$1',[id]);
            console.log(assetName,userEmail);
            await sendMailForAssetUpdate(userEmail,assetUpdationSubject,assetName);
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
        const assetDeletedOrNot: number = (await client.query("SELECT 1 AS asset_deleted_or_not FROM assets WHERE id=$1 AND archived_at IS NOT NULL", [req.body.assetId])).rows.length;
        const userDeletedOrNot: number = (await client.query("SELECT 1 AS user_deleted_or_not FROM users WHERE id=$1 AND archived_at IS NOT NULL", [req.body.userId])).rows.length;
        if (assetDeletedOrNot) {
            res.status(400).json({"message": "You can not assign asset because This asset is deleted"});
            return;
        }
        if (userDeletedOrNot) {
            res.status(400).json({"message": "You can not assign asset to this user because This user is deleted"});
            return;
        }
        const response: number = (await client.query("SELECT 1 AS asset_holder_or_not FROM assets WHERE id=$1 AND user_id IS NOT NULL", [req.body.assetId])).rows.length;
        if (!response) {
            await client.query("UPDATE assets SET user_id = $1 WHERE id = $2", [req.body.userId, req.body.assetId]);
            await client.query("INSERT INTO asset_history (asset_id,user_id,assigned_by,assigned_at) VALUES ($1,$2,$3,now())", [req.body.assetId, req.body.userId, req.body.user.id]);
            const userEmail:string = (await client.query('SELECT email FROM users WHERE id=$1',[req.body.userId])).rows[0].email;
            const assetName:IAsset = await client.query('SELECT * FROM assets WHERE id=$1',[req.body.assetId]);
            console.log(assetName,userEmail);
            await sendMailForAssetAssignment(userEmail,assetAssignSubject,assetName);
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
        if (!req.params.id) {
            res.status(400).send({error: "Please enter all required fields"});
            return;
        }
        const response: IAsset = (await client.query("SELECT * FROM assets WHERE user_id IS NOT NULL AND id=$1", [req.params.id]))
        if (response.rows.length == 0) {
            res.status(400).json({message: "Asset is already unassigned"});
            return;
        }
        const userEmail:string = (await client.query('SELECT email FROM users WHERE id=$1',[response.rows[0].user_id])).rows[0].email;
        await sendMailForAssetUnassignment(userEmail,assetUnassignSubject,response.rows[0].name,response.rows[0].asset_type);
        await client.query("UPDATE asset_history SET unassigned_at = now(),assigned_by = $3 WHERE asset_id=$1 AND user_id=$2 AND unassigned_at IS NULL", [req.params.id, response.rows[0].user_id, req.body.user.id]);
        await client.query("UPDATE assets SET user_id = null WHERE id=$1", [req.params.id]);
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
        const response:IAssetAndUserDetails = await client.query("SELECT a.name AS assetName,a.asset_type AS assetType, u.username AS username, u.email AS email FROM assets a LEFT JOIN users u ON a.user_id = u.id WHERE a.id=$1 AND a.user_id IS NOT NULL",[assetId])
        if(response.rows.length >0){
            await sendMailForAssetUnassignment(response.rows[0].email,assetUnassignSubject,response.rows[0].assetName,response.rows[0].assetType);
        }
        await client.query("update asset_requests set status='Disapproved' where status='Pending' and asset_id=$1",[assetId])
        await client.query("update asset_history set unassigned_at = $1 where asset_id = $2 and unassigned_at is null", [new Date(), assetId])
        await client.query("update assets set user_id=null , archived_at = $1 where id = $2", [new Date(), assetId])
        res.status(200).json({message: "asset deleted successfully"})
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};
