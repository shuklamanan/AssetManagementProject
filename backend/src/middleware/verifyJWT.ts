import jwt, {JwtPayload} from "jsonwebtoken";
import {Request, Response, NextFunction} from  'express'
import {ICreateUserRequestBody} from "../interfaces.ts";
import {executeQuery, handleError} from "../functions/requestResponse.ts";

export const verifyJwt = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    const authToken : string | undefined = req.header("Authorization");
    if(!authToken){
        handleError(res,401,"No token provided");
        return
    }
    try {
        const payload: JwtPayload = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET ?? "") as JwtPayload
        const user: ICreateUserRequestBody[] = (await executeQuery('select * from users where id = $1 and archived_at is null', [payload?.id], res)).rows
        if (!user.length) {
            handleError(res, 404, "user not found")
            return
        }
        req.body.user = user[0]
        next()
    }
    catch(error){
        handleError(res,401,`${error}`)
        return;
    }
}