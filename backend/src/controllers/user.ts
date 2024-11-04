import client from "../../postgresConfig.ts"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import {Response, Request} from "express";
import {requestWithUser} from "../interfaces/requestWithUser.ts";

dotenv.config()

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    })
}


const generateToken = (payload: { username: string }) => {
    const secretKey = process.env.ACCESS_TOKEN_SECRET??""; // Replace with your own secret key
    const options = {
        expiresIn: '24h',
    };
    return jwt.sign(payload, secretKey, options);
};

function isValidPassword(password: string) {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,20}$/;
    return regex.test(password);
}

interface createUserRequestBody {
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phoneNo: number,
    department: string,
    dateOfBirth: string
}
interface loginUserRequestBody {
    username: string,
    password: string
}

export const createUser = async (req:Request, res:Response):Promise<void> => {
    try {
        let {username, firstName, lastName, email, password, phoneNo, department, dateOfBirth} = req.body as createUserRequestBody;
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
        if (!(username && email && password && firstName && lastName && phoneNo)) {
            res.status(400).json({message: "some required fields are missing in req"})
            return;
        }
        await client.query("insert into users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) values ($1,$2,$3,Array ['Employee']::role[],$4,$5,$6,$7,$8)", [username, firstName, lastName, email, await hashPassword(password), phoneNo, department ?? null, dateOfBirth ?? null])
        res.status(201).json({message: "user created successfully"});
        return;
    } catch (error:any) {
        res.status(500).json({message: error?.message});
        return;
    }
};
export const loginUser = async (req:Request, res:Response):Promise<void> => {
    try {
        let {username, password} = req.body as loginUserRequestBody
        if (!(username && password)) {
             res.status(400).json({message: "some fields are missing in req"})
            return
        }
        let response = await client.query("select * from users where username=$1", [username]);
        if (response.rows.length === 0) {
             res.status(404).json({message: "user not found"})
            return
        }
        let user = response.rows[0]
        if (!bcrypt.compareSync(password, user.password)) {
             res.status(401).json({message: "user auth failed incorrect username or password"})
            return
        }
        let payload = {
            username: username,
        }
        let token = generateToken(payload)
        res.status(200).json({token: token});
        return
    } catch (error:any) {
        res.status(500).json({message: error?.message});
        return
    }
};
export const getRoles = async (req:Request, res:Response):Promise<void> => {
    try {
        res.status(200).json({roles: req.body.user.role.substring(1, req.body.user.role.length - 1).split(",")});
        return
    } catch (error:any) {
        res.status(500).json({message: error?.message});
        return
    }
};


