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