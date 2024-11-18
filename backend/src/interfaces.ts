export interface ILoginUserRequestBody {
    username: string,
    password: string
}

export interface ICreateUserQueryBody {
    id?:number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNumber: number,
    department: string,
    dateOfBirth: Date | string,
    createdAt ?: Date | string,
    archivedAt ?: Date | string,
    role:string[]
}

export interface ICreateUserRequestBody {
    id?:number,
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    role : string[],
    phone_number: number,
    department: string,
    date_of_birth: Date | string,
    created_at ?: Date | string,
    archived_at ?: Date | string,
}

export interface IUser {
    rows : ICreateUserRequestBody[];
}

export interface ICreateAssetQueryBody {
    id?: number;
    name: string,
    assetType: string,
    config: string,
    userId?: bigint,
    createdAt?: Date | string,
    archivedAt?: Date | string,
}

export interface ICreateAssetRequestBody {
    id?: number;
    name: string,
    asset_type: string,
    config: string,
    user_id?: bigint,
    created_at?: Date | string,
    archived_at?: Date | string,
}

export interface IAsset{
    rows : ICreateAssetRequestBody[];
}

export interface IMergeDetailsOfAssetAndUser extends ICreateAssetRequestBody , ICreateUserRequestBody{}

export interface IMergeDetailsOfAssetAndUserAndAssetHistory{
    id?: number,
    user_id : number,
    username : string,
    asset_id : number,
    asset_name : string,
    assigned_at? : string | Date,
    unassigned_at? : string | Date
}

export interface IPendingAssetRequest {
    id: number;
    assetId: number;
    userId: number;
    status: string;
    assetName: string;
    username: string;
}