import jwt, {JwtPayload} from "jsonwebtoken";
import {Request, Response, NextFunction} from  'express'

export const verifyUsername = async (req :Request,res:Response,next:NextFunction):Promise<void> => {
    try {
        const authToken : string | undefined = req.header("Authorization");
        if(!authToken){
            res.sendStatus(401)
            return
        }
        const payload : JwtPayload = jwt.verify(authToken,process.env.ACCESS_TOKEN_SECRET??"") as JwtPayload

        req.body.username = payload.username
        next()
    } catch (e:any) {
        res.sendStatus(401)
        return
    }
}