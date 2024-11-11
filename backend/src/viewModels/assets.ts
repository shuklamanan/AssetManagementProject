import { IMergeDetailsOfAssetAndUser } from "../interfaces.ts";

export class Asset {
    id: number | undefined;
    name: string;
    assetType: string;
    userId: bigint |undefined;
    config: string | null;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number | null;

    constructor({
                    id,
                    name,
                    asset_type,
                    user_id,
                    config,
                    username,
                    first_name,
                    last_name,
                    email,
                    phone_number
                }: IMergeDetailsOfAssetAndUser) {
        this.id = id;
        this.name = name;
        this.assetType = asset_type;
        this.userId = user_id;
        this.config = config;
        this.username = username;
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
        this.phoneNumber = phone_number;
    }
}
