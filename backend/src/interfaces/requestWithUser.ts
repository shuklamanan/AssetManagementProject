import {Request} from 'express'
 export type requestWithUser = Request & {
    user:any
}

