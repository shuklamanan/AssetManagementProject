import client from "../../postgresConfig.ts"
import {isValidPassword} from "../functions/validPassword.ts";
import {Request, Response} from "express";
import {
    ICreateUserQueryBody,
    ICreateUserRequestBody,
    IUser
} from "../interfaces.ts";
import {hashPassword} from "../functions/hashPassword.ts";

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

//TODO refactoring
export const getProfileDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(req.body.user);
        res.status(200).json({
            "username": req.body.user.username,
            "firsName": req.body.user.first_name,
            "lastName": req.body.user.last_name,
            "role": req.body.user.role,
            "email": req.body.user.email,
            "phoneNumber": req.body.user.phone_number,
            "department": req.body.user.department,
            "dateOfBirth": req.body.user.date_of_birth,
            "joiningDate": req.body.user.created_at,
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