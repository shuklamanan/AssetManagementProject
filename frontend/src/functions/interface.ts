export default interface IAsset {
    id: number;
    name: string;
    asset_type: string;
    username: string | null;
    config: Record<string, string>;
}

export interface IUser {
    id?:number,
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: number,
    date_of_birth: Date | string,
    created_at ?: Date | string,
}

export interface IAssetHistory {
    user_id: string | null;
    username: string | null;
    asset_id: number;
    asset_name: string;
    assigned_at: string | null;
    unassigned_at: string | null;
}

export interface IBodyStructureForAPI{
    username : string,
    password : string,
}

export interface IBodyStructureForUserAPI{
    username : string,
    firstName : string,
    lastName : string,
    email : string,
    password : string,
    phoneNumber : number,
    dateOfBirth : string,
}
