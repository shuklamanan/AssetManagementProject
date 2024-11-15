import client from "../../postgresConfig.ts"
import {Request, Response} from "express";
import {ICreateAssetRequestBody, IPendingAssetRequest} from "../interfaces.ts";
import mailAsset from "../functions/mailAsset.ts";
import {publishAssetNotification} from "../publishers/mailAsset.ts";

export const createAssetRequest = async (req: Request, res: Response):Promise<void> => {
    const { assetId }:{assetId:number} = req.body;
    try {
        const assetCheckResult:number = (await client.query(`SELECT 1 FROM assets WHERE id = $1 AND archived_at IS NULL`,[assetId])).rows.length

        if (!assetCheckResult) {
            res.status(400).json({ message: "Cannot create request: Asset is archived or does not exist" });
            return;
        }
        const requestOfSameUserForSameAsset : number = (await client.query(`SELECT 1 FROM asset_requests WHERE status='Pending' AND user_id = $1 AND asset_id = $2`,[req.body.user.id,assetId])).rows.length;
        if(requestOfSameUserForSameAsset){
           res.status(400).json({message: "You request is not approved yet."});
           return;
        }
        await client.query(`INSERT INTO asset_requests (asset_id, user_id, status) VALUES ($1, $2, 'Pending')`, [assetId, req.body.user.id]);
        res.status(201).json({message: "Asset request created successfully",});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
};

export const getAllPendingRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const result:IPendingAssetRequest[]= (await client.query(`SELECT ar.id,
                                                                 ar.asset_id AS "assetId",
                                                                 ar.user_id  AS "userId",
                                                                 a.name      AS "assetName",
                                                                 u.username  as "username"
                                                                 FROM asset_requests ar
                                                                 INNER JOIN assets a ON ar.asset_id = a.id
                                                                 INNER JOIN users u ON ar.user_id = u.id
                                                                 WHERE ar.status = 'Pending'`)).rows
        res.status(200).json(result);
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const checkRequestIsPendingOrNot= async(req:Request,res:Response):Promise<void> => {
    try {
        const assetId : string = req.params.id;
        if(!assetId){
            res.status(400).json({message:"we can't find Asset Id"});
            return;
        }
        const pendingRequestForSameUserAndAsset:number = (await client.query(`SELECT 1 AS pending_request FROM asset_requests WHERE asset_id = $1 AND user_id = $2 AND status = 'Pending'`,[assetId,req.body.user.id])).rows.length;
        console.log(pendingRequestForSameUserAndAsset);
        if(pendingRequestForSameUserAndAsset){
            res.status(200).json({"message": "Your request is still pending"});
            return;
        }
        res.status(200).json({"message": "You can request this asset"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

//TODO this can be better
export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, id } = req.body
        if (status !== 'Approved' && status !== 'Disapproved') {
            res.status(400).json({ message: "Invalid status value" });
            return;
        }
        if (status === 'Disapproved') {
            const updateStatus = (await client.query(`UPDATE asset_requests SET status = $1 WHERE id = $2 AND status = 'Pending' RETURNING *`, [status, id])).rows[0];
            if(updateStatus){
                await publishAssetNotification({
                    sub: "Asset Request Disapproved",
                    title: "Your asset request has been disapproved",
                    assetId: updateStatus.asset_id,
                    userId: updateStatus.user_id
                })
                res.status(200).json({ message: "Asset request disapproved successfully" });
                return;
            }else{
                res.status(200).json({ message: "Asset request is already fulfilled" });
                return;
            }
        }
        const userAndAssetResult: { user_id:number,asset_id:number, is_user_archived : string , is_asset_archived:string} [] = (await client.query(
            `SELECT u.id AS user_id,a.id AS asset_id,u.archived_at AS is_user_archived,a.archived_at AS is_asset_archived FROM users u JOIN asset_requests ar ON u.id = ar.user_id JOIN assets a ON ar.asset_id = a.id
            WHERE ar.id = $1`,
            [id]
        )).rows
        console.log(userAndAssetResult,id);
        const isUserArchived :string|null =  userAndAssetResult[0].is_user_archived ?? null;
        const isAssetArchived:string|null =  userAndAssetResult[0].is_asset_archived ?? null;
        console.log(isAssetArchived);
        console.log(isUserArchived);
        if(isUserArchived || isAssetArchived){
            res.status(400).json({ message: (isUserArchived) ? "user associated with request is archived" : "asset associated with request is archived" });
            return;
        }
        const userId:number = userAndAssetResult[0].user_id
        const assetId:number = userAndAssetResult[0].asset_id
        const isUserAssignedOrNot = (await client.query(
            `UPDATE assets SET user_id = $1 WHERE id = $2 AND EXISTS(select 1 from asset_requests where status='Pending' and id=$3) AND EXISTS(SELECT 1 FROM assets WHERE id = $2 AND user_id IS NULL) RETURNING *`,
            [userId, assetId,id]
        )).rows;
        console.log(isUserAssignedOrNot);
        if(!isUserAssignedOrNot.length){
            res.status(400).json({ message: `Either request is already fulfilled OR asset with ${assetId} is already assigned to someone` });
            return;
        }
        await client.query(
            `INSERT INTO asset_history (asset_id, user_id, assigned_by, assigned_at, unassigned_at) 
            VALUES ($1, $2, $3, NOW(), NULL)`,
            [assetId, userId, req.body.user.id]
        );

        await client.query(
            `UPDATE asset_requests SET status = $1 WHERE id = $2`,
            [status, id]
        );
        await client.query(`UPDATE asset_requests SET status = $1 WHERE status = 'Pending' AND asset_id = $2`, ["Disapproved", assetId]);
        await publishAssetNotification({
            sub: "Asset Request Approved",
            title: "Your asset request has been approved",
            assetId: assetId,
            userId: userId
        })
        res.status(200).json({ message: "Asset request approved and asset assigned successfully" });
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}
