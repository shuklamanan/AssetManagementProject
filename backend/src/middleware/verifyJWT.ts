import jwt, {JwtPayload} from "jsonwebtoken";
import client from "../../postgresConfig.ts";
import {Request, Response, NextFunction} from  'express'
import {IUser} from "../interfaces/requestWithUser.ts";

export const verifyJwt = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    try {
        const authToken : string | undefined = req.header("Authorization");
        console.log(authToken)
        console.log(!authToken)
        if(!authToken){
            res.sendStatus(401)
            return
        }
        const payload : JwtPayload = jwt.verify(authToken,process.env.ACCESS_TOKEN_SECRET??"") as JwtPayload
        console.log(payload);
        const user :IUser =  await client.query('select * from users where id = $1',[payload?.id])
        console.log(user)
        if(user.rows.length===0){
             res.status(404).json({message:"user not found"})
            return
        }
        req.body.user = user.rows[0]
        next()
    } catch (e) {
        res.sendStatus(401)
        return
    }
}