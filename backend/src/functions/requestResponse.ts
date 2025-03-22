import {Response} from "express";
// @ts-ignore
import client from "../../postgresConfig.ts"

export const handleError = (res:Response,statusCode:number,message:string):void=>{
    res.status(statusCode).json({message:message})
    return;
}

export const handleSuccess = (res:Response,statusCode:number,message?:string,data?:any):void=>{
    if(message){
        res.status(statusCode).json({message:message})
    }
    else{
        console.log("print here",statusCode, message , data);
        res.status(statusCode).json(data);
    }
    return;
}

export const executeQuery = async (query:string,params:any[],res:Response):Promise<any> => {
    try{
        return await client.query(query, params);
    }
    catch(err:any){
        handleError(res,500,`Internal Server Error:${err.message}`);
        return;
    }
}