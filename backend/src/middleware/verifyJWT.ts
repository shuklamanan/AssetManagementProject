import jwt, {JwtPayload} from "jsonwebtoken";
import client from "../../postgresConfig.ts";
import {Request, Response, NextFunction} from  'express'
import {ICreateUserRequestBody, IUser} from "../interfaces.ts";

export const verifyJwt = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    try {
        const authToken : string | undefined = req.header("Authorization");
        if(!authToken){
            res.status(401).json({message:"No token provided"})
            return
        }
        const payload : JwtPayload = jwt.verify(authToken,process.env.ACCESS_TOKEN_SECRET??"") as JwtPayload
        const user :ICreateUserRequestBody[] =  (await client.query('select * from users where id = $1 and archived_at is null',[payload?.id])).rows
        if(user.length===0){
            res.status(404).json({message:"user not found"})
            return
        }
        req.body.user = user[0]
        next()
    } catch (e:any) {
        res.send(401).json({message:"Internal Server Error"})
        return
    }
}