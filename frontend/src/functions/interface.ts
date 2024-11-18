export default interface IAsset {
    id: number;
    name: string;
    assetType: string;
    username: string | null;
    config: Record<string, string>;
}

export interface IAssetRequest {
    id: number,
    assetId: number,
    userId:number,
    assetName: string;
    username: string | null;
}

export interface IAssetRequestStatusUpdate{
    id:number,
    status:string
}

export interface IUser {
    id?:number,
    username: string,
    firstName: string,
    lastName: string,
    role?:string[],
    email: string,
    phoneNumber: number,
    department?:string,
    dateOfBirth: Date | string,
    createdAt ?: Date | string,
}

export interface IAssetHistory {
    userId: string | null;
    username: string | null;
    assetId: number;
    assetName: string;
    assignedAt: string | null;
    unassignedAt: string | null;
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
    role? : string[],
    password : string,
    phoneNumber : number,
    dateOfBirth : string,
}

export interface ILoginToken{
    token?:string,
    message?:string
}

export interface IForgetPassword{
    username:string
}

export interface IForgetPasswordToken{
    username?:string
    message?:string
}

export interface IResetPassword{
    otp:number,
    password:string,
    confirmPassword:string,
    username:string
}