import {headers} from "../functions/api.ts";

export async function executeGetApi(api:string,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
    });
    const answer:any = await response.json();
    console.log(answer);
    if(answer.message == "user not found"){
        localStorage.removeItem('token');
        location.href = "/src/html/login.html";
    }
    return [response,answer];
}

export async function executePostPutDeleteApi(api:string,method:string,body:any,apiHeaders?:any) : Promise<any>{
    const response :Response= await fetch(api, {
        headers: apiHeaders??headers,
        method: method,
        body: JSON.stringify(body),
    });
    const answer:any = await response.json();
    return [response,answer];
}