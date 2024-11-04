import jwt from "jsonwebtoken";
import client from "../../postgresConfig.ts";
import {Request, Response, NextFunction} from  'express'
import {requestWithUser} from "../interfaces/requestWithUser.ts";
interface JwtPayload {
    username: string;
}

export const verifyJwt = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    try {
        const payload = jwt.verify(req.header("Authorization")??"",process.env.ACCESS_TOKEN_SECRET??"") as JwtPayload
        const user=  await client.query('select * from users where username = $1',[payload?.username])
        if(user.rows.length===0){
             res.status(404).json({message:"user not found"})
            return
        }
        req.body.user = user.rows[0]
        next()
    } catch (e) {
        res.sendStatus(401)
    }

}