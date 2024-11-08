import {ICreateUserRequestBody} from "../interfaces.ts";

export class User {
    id: number | undefined;
    username: string;
    firstName: string;
    lastName: string;
    role : string[];
    email: string;
    phoneNumber: number;
    department: string | null;
    dateOfBirth: Date;
    joiningDate : Date;

    constructor({id,username, first_name, last_name, email,role, phone_number, department, date_of_birth,created_at}: ICreateUserRequestBody) {
        this.id = id;
        this.username = username;
        this.firstName = first_name;
        this.lastName = last_name;
        this.role = role;
        this.email = email;
        this.phoneNumber = phone_number;
        this.department = department;
        this.dateOfBirth = new Date(date_of_birth);
        this.joiningDate = new Date(created_at!);
    }
}
