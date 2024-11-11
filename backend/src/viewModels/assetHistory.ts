import { IMergeDetailsOfAssetAndUserAndAssetHistory } from "../interfaces.ts";

export class AssetHistory {
    id: number | undefined;
    userId: number;
    username: string;
    assetId: number;
    assetName: string;
    assignedAt: Date | null;
    unassignedAt: Date | null;

    constructor({
                    id,
                    user_id,
                    username,
                    asset_id,
                    asset_name,
                    assigned_at,
                    unassigned_at
                }: IMergeDetailsOfAssetAndUserAndAssetHistory) {
        this.id = id;
        this.userId = user_id;
        this.username = username;
        this.assetId = asset_id;
        this.assetName = asset_name;
        this.assignedAt = assigned_at ? new Date(assigned_at) : null;
        this.unassignedAt = unassigned_at ? new Date(unassigned_at) : null;
    }
}
