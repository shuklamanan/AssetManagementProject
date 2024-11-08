import {ICreateUserRequestBody} from "../interfaces.ts";

export class User {
    id: number | undefined;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number;
    department: string | null;
    dateOfBirth: Date;

    constructor({id,username, first_name, last_name, email, phone_number, department, date_of_birth}: ICreateUserRequestBody) {
        this.id = id;
        this.username = username;
        this.firstName = first_name;
        this.lastName = last_name;
        this.email = email;
        this.phoneNumber = phone_number;
        this.department = department;
        this.dateOfBirth = new Date(date_of_birth);
    }
}
