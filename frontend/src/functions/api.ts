const api: string = "http://localhost:5001/";
const userApi:string = api + "users/";
const assetApi:string =  api + "assets/";

export const verifyUserViaOtpApi:string = userApi + "verify/";

export const loginApi:string = userApi + "login/";
export const signupApi:string = userApi + "signup/";

export const forgetPasswordApi:string = userApi + "password/forget";
export const resetPasswordApi:string = userApi + "password/reset";

export const getAllUsersApi:string = userApi;
export const getProfileApi:string = userApi + "profile/";
export const getRolesApi:string = userApi + "roles/";
export const createUserViaAdminApi:string = userApi;
export const deleteUserApi:string = userApi;

export const getAllAssetsApi:string = assetApi;
export const createAssetApi:string = assetApi;
export const assetHistoryApi:string = assetApi + "history/";
export const assetAssignApi:string = assetApi + "assign/";
export const assetUnassignApi:string = assetApi + "unassign/";
export const updateAssetApi:string = assetApi;
export const deleteAssetApi:string = assetApi;
export const assetRequestApi:string = assetApi + "request/";
export const assetPendingApi:string = assetApi + "request/pending/";
export const assetUpdateStatusApi:string = assetApi + "request/status/";

export const headers :Record<string,string> = {
    'Authorization': `${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
}
