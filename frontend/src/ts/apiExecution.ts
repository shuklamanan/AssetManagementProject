import {headers} from "../functions/api.ts";

export async function executeGetApi(api:string,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
    });
    const data:any = await response.json();
    console.log(data,data);
    if(data.message == "user not found"){
        localStorage.removeItem('token');
        location.href = "/src/html/login.html";
    }
    return [response,data];
}

export async function executePostApi(api:string,body:any,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
        method: "POST",
        body: JSON.stringify(body),
    });
    const data:any = await response.json();
    console.log(data);
    return [response,data];
}

export async function executePutApi(api:string,body:any,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
        method: "PUT",
        body: JSON.stringify(body),
    });
    const data:any = await response.json();
    return [response,data];
}

export async function executeDeleteApi(api:string,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
        method: "DELETE",
    });
    const data:any = await response.json();
    return [response,data];
}