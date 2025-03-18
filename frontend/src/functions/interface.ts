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
    username : FormDataEntryValue,
    password : FormDataEntryValue,
}

export interface IBodyStructureForUserAPI{
    username : FormDataEntryValue,
    firstName : FormDataEntryValue,
    lastName : FormDataEntryValue,
    email : FormDataEntryValue,
    role? : string[],
    password : FormDataEntryValue,
    phoneNumber : FormDataEntryValue | number,
    dateOfBirth : FormDataEntryValue,
}

export interface ILoginToken{
    token?:string,
    message?:string
}

export interface IForgetPassword{
    username:FormDataEntryValue
}

export interface IForgetPasswordToken{
    username?:string
    message?:string
}

export interface IResetPassword{
    otp:FormDataEntryValue,
    password:FormDataEntryValue,
    confirmPassword:FormDataEntryValue,
    username:FormDataEntryValue
}