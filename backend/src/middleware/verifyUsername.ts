import jwt, {JwtPayload} from "jsonwebtoken";
import {Request, Response, NextFunction} from  'express'
import {handleError} from "../functions/requestResponse.ts";

export const verifyUsername = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    try {
        const authToken : string | undefined = req.header("Authorization");
        if(!authToken){
            handleError(res,401,'Unauthorized')
            return
        }
        const payload : JwtPayload = jwt.verify(authToken,process.env.ACCESS_TOKEN_SECRET??"") as JwtPayload
        req.body.username = payload.username
        next()
    } catch (e:any) {
        handleError(res,401,'Unauthorized Or Token expired')
        return
    }
}