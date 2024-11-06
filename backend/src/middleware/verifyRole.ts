import {Request, Response, NextFunction} from  'express'

export const verifyRole = (roles: string[]) => {
    return (req:Request,res:Response,next:NextFunction) : Promise<void> | void   => {
        for(let role of roles){
            if(req.body.user.role.includes(role)){
                continue
            }
            res.sendStatus(401)
            return
        }
        return next();
    }
}