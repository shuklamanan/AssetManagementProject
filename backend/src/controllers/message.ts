import {Request, Response} from "express";
import {executeQuery, handleError} from "../functions/requestResponse";

export const createMessage = async (req: Request, res: Response):Promise<void> => {
    if(!req.body.message){
        handleError(res,400,"some required fields are missing in request");
        return;
    }
    await executeQuery("INSERT INTO message(message_sender,message) VALUES ($1,$2)",[req.body.user.id,req.body.message],res);
    const userMail = (await executeQuery("SELECT email FROM users WHERE archived_at IS NULL",[],res)).rows;
    for(let i:number=0;i<userMail.length;i++){
        //emailNotificationFunction
    }
    console.log(userMail);
    handleError(res,200,"Successfully created message");
}