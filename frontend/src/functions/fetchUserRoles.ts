import {getRolesApi} from "./api.ts";
import {executeGetApi} from "../ts/apiExecution.ts";

export default async function fetchUserRoles(): Promise<string[]> {
    const token : string = localStorage.getItem('token')!;
    const apiHeaders:object = {
        'Authorization': token,
        'Content-Type': 'application/json',
    }
    const responseAnswerArray = await executeGetApi(getRolesApi,apiHeaders);
    return responseAnswerArray[1];
}
