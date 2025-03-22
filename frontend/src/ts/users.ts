import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IBodyStructureForUserAPI, IUser} from "../functions/interface.ts";
import {createUserViaAdminApi, deleteUserApi} from "../functions/api.ts";
import {executeDeleteApi, executePostApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";
import {users} from "../functions/getUsers.ts";
import {isTokenAvailableOrNot, logout} from "../functions/helperFunctions.ts";

isTokenAvailableOrNot()
const logoutElement: HTMLElement = document.getElementById("logout")!;
const roles: string[] = await fetchUserRoles();
if (!roles.includes("Admin")) {
    location.href = '/src/html/index.html'
}
displayUsers(users)
console.log("users",users)

async function deleteUser(user: IUser): Promise<void> {
    const deleteUser: string = deleteUserApi + `${user.id}`;

    const responseDataArray = await executeDeleteApi(deleteUser);
    if (responseDataArray[0].ok) {
        console.log(`User ${user.id} deleted successfully`);
        displayUsers(users)
        window.location.reload();
    } else {
        console.log('Failed to delete user');
    }
}

function displayUsers(users: IUser[]): void {
    const tbody: HTMLElement = document.getElementById('userTableBody') as HTMLElement;
    const addUserBtn: HTMLElement = <HTMLElement>document.getElementById('createUser');
    const tableHead: HTMLElement = document.getElementById('table-head')!;
    addUserBtn!.setAttribute('data-toggle', 'modal');
    addUserBtn!.setAttribute('data-target', '#addUserModal');
    createTable(tableHead, tbody, users, [deleteUser], true, ["Delete"], ["btn btn-danger"], ["Delete"]);
}

async function createUserByAdmin(api: string, body: IBodyStructureForUserAPI): Promise<void> {
    const responseDataArray = await executePostApi(api, body);
    const data = responseDataArray[1];
    if (!(responseDataArray[0].status >= 200 && responseDataArray[0].status < 300)) {
        alert(data.message);
        return;
    }
    window.location.reload();
}

const addUserForm: HTMLFormElement = <HTMLFormElement>document.getElementById("addUserForm");
addUserForm.addEventListener("submit", async (e: Event): Promise<void> => {
    e.preventDefault();
    const formData: FormData = new FormData(addUserForm);
    const formValues: { [k: string]: FormDataEntryValue } = Object.fromEntries(formData);
    const getRole = document.getElementById('role')! as HTMLSelectElement;
    const roleValue: string | null = getRole.value;
    if ((formValues.phoneNumber).toString().length != 10 || parseInt(<string>formValues.phoneNumber) < 0) {
        alert("Please enter a valid phone number");
        location.reload();
    }
    const body: IBodyStructureForUserAPI = {
        username: formValues.username,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        role: [roleValue ?? ""],
        password: formValues.password,
        phoneNumber: parseInt(<string>formValues.phoneNumber),
        dateOfBirth: formValues.dateOfBirth,
    }
    console.log(body);
    await createUserByAdmin(createUserViaAdminApi, body);
})

logout(logoutElement);