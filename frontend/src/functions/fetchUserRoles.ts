import {getRolesApi} from "./api.ts";

export default async function fetchUserRoles(): Promise<string[]> {
    const token : string = localStorage.getItem('token')!;
    const response: Response = await fetch(getRolesApi, {
        method: 'GET',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}
