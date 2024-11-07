import client from "../../postgresConfig.ts"
import bcrypt from 'bcrypt'
import jwt, {JwtPayload} from 'jsonwebtoken';
import dotenv from "dotenv";
import {Request, Response} from "express";
import {
    ICreateUserQueryBody,
    ICreateUserRequestBody,
    ILoginUserRequestBody,
    IUser
} from "../interfaces/requestWithUser.ts";

dotenv.config()

async function hashPassword(password: string): Promise<string> {
    const saltRounds : number = 10;
    return await new Promise((resolve, reject) : void => {
        bcrypt.hash(password, saltRounds, function (err :Error | undefined, hash : string) {
            if (err) reject(err)
            resolve(hash)
        });
    })
}


const generateToken = (payload: JwtPayload) => {
    const secretKey: string = process.env.ACCESS_TOKEN_SECRET ?? ""; // Replace with your own secret key
    const options = {
        expiresIn: '24h',
    };
    return jwt.sign(payload, secretKey, options);
};

function isValidPassword(password: string) : boolean {
    const regex : RegExp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,20}$/;
    return regex.test(password);
}

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
        await client.query("insert into users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) values ($1,$2,$3,Array ['Employee']::role[],$4,$5,$6,$7,$8)", [username, firstName, lastName, email, await hashPassword(password), phoneNumber, department ?? null, dateOfBirth ?? null])
        res.status(201).json({message: "user created successfully"});
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
        let response : IUser = await client.query("select * from users where username=$1 and archived_at is null", [username]);
        if (response.rows.length === 0) {
            res.status(404).json({message: "user not found"})
            return
        }
        let user: ICreateUserRequestBody = response.rows[0]
        if (!bcrypt.compareSync(password, user.password)) {
            res.status(401).json({message: "user auth failed incorrect username or password"})
            return
        }
        let payload : JwtPayload = { id: user.id }
        let token: string = generateToken(payload)
        res.status(200).json({token: token});
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};
export const getRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        res.status(200).json(req.body.user.role.substring(1, req.body.user.role.length - 1).split(","));
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const response: IUser = await client.query("SELECT id,username,first_name,last_name,role,email,phone_number,department,date_of_birth FROM users WHERE archived_at IS NULL ORDER BY role")
        const allUsers : ICreateUserRequestBody[] | undefined = response?.rows;
        res.status(200).json(allUsers ?? []);
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const getProfileDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.body.user);
        res.status(200).json({
            "username": req.body.user.username,
            "first_name": req.body.user.first_name,
            "last_name": req.body.user.last_name,
            "role": req.body.user.role,
            "email": req.body.user.email,
            "phone_number": req.body.user.phone_number,
            "department": req.body.user.department,
            "date_of_birth": req.body.user.date_of_birth,
            "joining_date": req.body.user.created_at,
        });
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        let userId: string = req.params.id
        await client.query("update assets set user_id=null where user_id=$1", [userId])
        await client.query("update asset_history set unassigned_at = $1 where unassigned_at is null and user_id=$2 ",[new Date(),userId])
        await client.query("update users set archived_at = $1 where id = $2", [new Date(), userId])
        res.status(200).json({message: "user deleted successfully"})
        return
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return
    }
};
export const createUserViaAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        let {
            username,
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            department,
            dateOfBirth,
            role
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
        if (!(username && email && password && firstName && lastName && phoneNumber && role?.length>0)) {
            res.status(400).json({message: "some required fields are missing in req"})
            return;
        }
        await client.query("insert into users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) values ($1,$2,$3,$9,$4,$5,$6,$7,$8)", [username, firstName, lastName, email, await hashPassword(password), phoneNumber, department ?? null, dateOfBirth ?? null,role])
        res.status(201).json({message: "user created successfully"});
        return;
    } catch (error: any) {
        res.status(500).json({message: error?.message});
        return;
    }
};