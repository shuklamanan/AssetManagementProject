import {isValidPassword} from "../functions/validPassword.ts";
import {Request, Response} from "express";
import {ICreateUserQueryBody, ICreateUserRequestBody} from "../interfaces.ts";
import {User} from "../viewModels/users.ts";
import {hashPassword} from "../functions/hashPassword.ts";
import {publishUserNotification} from "../publishers/mailUser.ts";
import {executeQuery, handleError, handleSuccess} from "../functions/requestResponse.ts";

export const getRoles = async (req: Request, res: Response): Promise<void> => {
    try {
        handleSuccess(res,200,'',req.body.user.role.substring(1, req.body.user.role.length - 1).split(","))
        return
    } catch (error: any) {
        handleError(res,500,error?.message)
        return
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const allUsers: ICreateUserRequestBody[] = (await executeQuery("SELECT id,username,first_name,last_name,role,email,phone_number,department,date_of_birth FROM users WHERE archived_at IS NULL ORDER BY role",[],res)).rows
    const users = allUsers.map(userData => new User(userData));
    handleSuccess(res,200,"",users ?? [])
}

export const getProfileDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        handleSuccess(res,200,'',new User(req.body.user))
        return;
    } catch (error: any) {
        handleError(res,500,error?.message)
        return;
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    let userId: string = req.params.id
    if(req.body.user.id == userId){
        handleError(res,401,"You can't delete Yourself");
        return;
    }
    await executeQuery("update assets set user_id=null where user_id=$1", [userId],res)
    await executeQuery("update asset_history set unassigned_at = $1 where unassigned_at is null and user_id=$2 ", [new Date(), userId],res)
    await executeQuery("update asset_requests set status='Disapproved' where status='Pending' and user_id=$1", [userId],res)
    const users: ICreateUserRequestBody[] = (await executeQuery("update users set archived_at = $1 where id = $2 returning *", [new Date(), userId],res)).rows
    const user = users[0]
    await publishUserNotification({
        email: user.email,
        subject:   "Account deleted",
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        userEmail: user.email,
        phoneNumber: user.phone_number,
        dateOfBirth: new Date(user.date_of_birth),
        title: "Your account in asset management is being suspended by admin",
    })
    handleSuccess(res,200,"user deleted successfully",users ?? [])
};
export const createUserViaAdmin = async (req: Request, res: Response): Promise<void> => {
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
        handleError(res,400,`Password should contain:-\n' +
                    '                    It contains at least 8 characters and at most 20 characters.\n' +
                    '                    It contains at least one digit.\n' +
                    '                    It contains at least one upper case alphabet.\n' +
                    '                    It contains at least one lower case alphabet.\n' +
                    '                    It contains at least one special character which includes !@#$%&*()-+=^.\n' +
                    '                    It doesn’t contain any white space.`)
        return
    }
    if (!(username && email && password && firstName && lastName && phoneNumber && role?.length > 0)) {
        handleError(res,400,"some required fields are missing in request")
        return;
    }
    await executeQuery("insert into users(username, first_name, last_name, role, email, password, phone_number, department, date_of_birth) values ($1,$2,$3,$9,$4,$5,$6,$7,$8)", [username, firstName, lastName, email, await hashPassword(password), phoneNumber, department ?? null, dateOfBirth ?? null, role],res)
    await publishUserNotification({
        email: email,
        subject:   "Creation of account by admin",
        username: username,
        firstName: firstName,
        lastName: lastName,
        userEmail: email,
        phoneNumber: phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        title: "your account has been created by admin the username and password for your account are: username:" + username + " password:" + password,
    })
    handleSuccess(res,201,"user created successfully")
};