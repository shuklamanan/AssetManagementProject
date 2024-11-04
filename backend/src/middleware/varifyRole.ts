import {Request, Response, NextFunction} from  'express'
export const verifyRole = (roles) => {
    return (req:Request,res:Response,next:NextFunction) => {
        for(let role of roles){
            if(req.body.user.role.includes(role)){
                continue
            }
            return res.sendStatus(401)
        }
        return next();
    }
}

