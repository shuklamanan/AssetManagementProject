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
import redisClient from "../../redisConfig.ts";

dotenv.config()

const generateToken = (payload: JwtPayload,time:string) => {
    const secretKey: string = process.env.ACCESS_TOKEN_SECRET ?? ""; // Replace with your own secret key
    const options = {
        expiresIn: time,
    };
    return jwt.sign(payload, secretKey, options);
};

const storeOTP = async (key: string, otp: number): Promise<void> => {
    // noinspection TypeScriptValidateTypes
    await redisClient.setEx(key, 300, otp.toString());
};

const getOTP = async (key: string): Promise<string | null> => {
    // noinspection TypeScriptValidateTypes
    return await redisClient.get(key);
};

const deleteOTP = async (key: string): Promise<void> => {
    // noinspection TypeScriptValidateTypes
    await redisClient.del(key);
};

//we can add date based otp system adding 5min plus date to the current otp and checking when verification if the date is < current date otherwise otp fails
//if we have used redis or something similar this would be much more efficient but this works fine as well
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
        const tempUser = {
            username,
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            role: ['Employee'],
            phone_number: phoneNumber,
            department: department ?? null,
            date_of_birth: dateOfBirth,
        };
        await storeOTP(username, otp);
        await redisClient.setEx(`tempUser:${username}`, 300, JSON.stringify(tempUser));
        let token:string = generateToken({username:username},'24h')
        await mailOTP(otp,email,"OTP verification")
        res.status(200).json({OTPtoken:token});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let {username, password} : ILoginUserRequestBody= req.body
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
        const storedOTP = await getOTP(username);
        if (!storedOTP || Number(storedOTP) != otp) {
            res.status(400).json({ message: 'invalid or expired OTP.' });
            return
        }
        const userString = await redisClient.get(`tempUser:${username}`);
        if (!userString) {
            res.status(400).json({ message: 'User data expired or not found.' });
            return;
        }

        const user = JSON.parse(userString) as ICreateUserRequestBody;

        await client.query(
            'INSERT INTO users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) VALUES ($1, $2, $3, ARRAY [\'Employee\']::role[], $4, $5, $6, $7, $8)',
            [
                user.username,
                user.first_name,
                user.last_name,
                user.email,
                await hashPassword(user.password),
                user.phone_number,
                user.department,
                user.date_of_birth,
            ]
        );

        await deleteOTP(username);
        await redisClient.del(`tempUser:${username}`);
        res.status(200).json({ message: 'Signup successful.' });
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
        const user = (await client.query("SELECT * FROM users WHERE archived_at IS NULL AND username = $1",[req.body.username])).rows;
        if(user.length === 0) {
            res.status(404).json({message:"user not found"})
            return;
        }
        const otp:number = generateOTP(4)
        await storeOTP(user[0].username, otp);
        await mailOTP(otp,user[0].email,"Password Reset")
        res.status(200).json({username:req.body.username});
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
        const username:string = req.body.username;
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
        console.log(req.body);
        const storedOTP = await getOTP(username);
        if(otp!=Number(storedOTP)){
            res.status(400).json({message:"Password Reset is failed"})
            return;
        }
        await deleteOTP(username);
        await client.query("UPDATE users SET password = $1 WHERE archived_at IS NULL AND username=$2",[await hashPassword(password),req.body.username]);
        res.status(200).json({message:"Password Reset Successful"})
        return
    }
    catch(error:any){
        res.status(500).json({message: error?.message});
        return
    }
}