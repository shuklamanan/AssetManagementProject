import {Request, Response} from "express";
import {ICreateUserQueryBody, ICreateUserRequestBody, ILoginUserRequestBody} from "../interfaces.ts";
import client from "../../postgresConfig";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import {generateOTP} from "../functions/generateOTP.ts";
import jwt, {JwtPayload} from "jsonwebtoken";
import {isValidPassword} from "../functions/validPassword";
import {isValidEmail} from "../functions/isValidEmail.ts";
import mailOTP from "../functions/mailOTP.ts";
import {hashPassword} from "../functions/hashPassword.ts";
dotenv.config()
const generateToken = (payload: JwtPayload,time:string) => {
    const secretKey: string = process.env.ACCESS_TOKEN_SECRET ?? ""; // Replace with your own secret key
    const options = {
        expiresIn: time,
    };
    return jwt.sign(payload, secretKey, options);
};

let tempSignupUserObj: { [key:string]:ICreateUserRequestBody } = {}
let tempPasswordResetObj: { [key:string]:number } = {}
let tempUsernameOTPObj: { [key:string]:number } = {}
//if we have used redis or something similar this would be much more efficient but this works fine as well
setInterval(() => {
    tempSignupUserObj = {}
    tempUsernameOTPObj = {}
    tempPasswordResetObj = {}
}, 1000000)
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let {
            username,
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            department,
            dateOfBirth
        } = req.body as ICreateUserQueryBody;
        if (!isValidPassword(password)) {
            res.status(400).json({
                message: '`Password should contain:-\n' +
                    '                    It contains at least 8 characters and at most 20 characters.\n' +
                    '                    It contains at least one digit.\n' +
                    '                    It contains at least one upper case alphabet.\n' +
                    '                    It contains at least one lower case alphabet.\n' +
                    '                    It contains at least one special character which includes !@#$%&*()-+=^.\n' +
                    '                    It doesn’t contain any white space.`'
            });
            return
        }
        if (!(username && email && password && firstName && lastName && phoneNumber)) {
            res.status(400).json({message: "some required fields are missing in req"})
            return;
        }
        if (!isValidEmail(email, process.env.DOMAIN??'gmail')) {
            res.status(400).json({message: "only domain name " + process.env.DOMAIN + " is allowed"})
            return;
        }
        const otp = generateOTP(4)
        tempUsernameOTPObj[`${username}`] = otp
        tempSignupUserObj[`${username}`] = {
            username: username,
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            role : ['Employee'],
            phone_number: phoneNumber,
            department: department??null,
            date_of_birth: dateOfBirth,
        }
        let token:string = generateToken({username:username},'24h')
        await mailOTP(otp,email,"OTP verification")
        console.log(tempUsernameOTPObj,tempSignupUserObj)
        res.status(200).json({OTPtoken:token});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let {username, password} = req.body as ILoginUserRequestBody
        if (!(username && password)) {
            res.status(400).json({message: "some fields are missing in req"})
            return
        }
        let response: ICreateUserRequestBody[] = (await client.query("select * from users where username=$1 and archived_at is null", [username])).rows
        if (response.length === 0) {
            res.status(404).json({message: "user not found"})
            return
        }
        let user: ICreateUserRequestBody = response[0]
        if (!bcrypt.compareSync(password, user.password??"")) {
            res.status(401).json({message: "user auth failed incorrect username or password"})
            return
        }
        let payload: JwtPayload = {id: user.id}
        let token: string = generateToken(payload,'24h')
        res.status(200).json({token: token});
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        let username:string = req.body.username
        let otp:number = Number(req.body.otp)
        console.log(otp,tempUsernameOTPObj[`${username}`])
        if(tempUsernameOTPObj[`${username}`]===otp){
            let user :ICreateUserRequestBody = tempSignupUserObj[`${username}`]
            await client.query("insert into users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) values ($1,$2,$3,Array ['Employee']::role[],$4,$5,$6,$7,$8)", [username, user.first_name, user.last_name, user.email, await hashPassword(user.password), user.phone_number, user.department ?? null, user.date_of_birth ?? null])
            res.status(200).json({message:"signup successful"})
            return
        }
        res.status(400).json({message:"signup failed"})
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};

export const forgotPassword = async (req:Request, res:Response):Promise<void>=>{
    try{
        if(!req.body.username){
            res.status(404).json({message:"username is not found"})
            return
        }
        const user : {email:string}[] = (await client.query("SELECT email FROM users WHERE archived_at IS NULL AND username = $1",[req.body.username])).rows;
        if(user.length === 0) {
            res.status(404).json({message:"user not found"})
            return;
        }
        const otp:number = generateOTP(4)
        tempPasswordResetObj[`${req.body.username}`] = otp
        await mailOTP(otp,user[0].email,"Password Reset")
        const token:string = generateToken({username:req.body.username},'2m');
        res.status(200).json({secondToken:token});
        return;
    }
    catch(error:any){
        res.status(500).json({message: error?.message});
        return
    }
}

export const resetPassword = async (req:Request,res:Response):Promise<void>=>{
    try{
        const otp:number=parseInt(req.body.otp);
        const password :string= req.body.password.trim();
        const confirmPassword:string = req.body.confirmPassword.trim();
        if(!password || !confirmPassword || password!=confirmPassword){
            res.status(400).json({message:"Both Passwords do not match"})
            return;
        }
        if (!isValidPassword(password)) {
            res.status(400).json({
                message: `Password should contain:-\n' +
                    '                    It contains at least 8 characters and at most 20 characters.\n' +
                    '                    It contains at least one digit.\n' +
                    '                    It contains at least one upper case alphabet.\n' +
                    '                    It contains at least one lower case alphabet.\n' +
                    '                    It contains at least one special character which includes !@#$%&*()-+=^.\n' +
                    '                    It doesn't contain any white space.`
            });
            return
        }
        if(otp!=tempPasswordResetObj[`${req.body.username}`]){
            res.status(400).json({message:"Password Reset is failed"})
            return;
        }
        await client.query("UPDATE users SET password = $1 WHERE archived_at IS NOT NULL AND username=$2",[await hashPassword(password),req.body.username]);
        res.status(200).json({message:"Password Reset Successful"})
        return
    }
    catch(error:any){
        res.status(500).json({message: error?.message});
        return
    }
}