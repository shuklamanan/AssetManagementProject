import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IBodyStructureForUserAPI, IUser} from "../functions/interface.ts";
import {createUserViaAdminApi, deleteUserApi, getAllUsersApi} from "../functions/api.ts";
import {executeDeleteApi, executeGetApi, executePostApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles:string[] = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

async function fetchUsers(): Promise<IUser[]> {
    const responseDataArray  = await executeGetApi(getAllUsersApi);
    return responseDataArray[1];
}

let users:IUser[] = await fetchUsers()
displayUsers(users)
console.log(users)
document.getElementById("logout")!.addEventListener('click',() : void=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})

async function deleteUser(user: IUser): Promise<void> {
    const deleteUser: string = deleteUserApi + `${user.id}`;

    const responseDataArray = await executeDeleteApi(deleteUser);
    if (responseDataArray[0].ok) {
        console.log(`User ${user.id} deleted successfully`);
        users = await fetchUsers();
        displayUsers(users)
        window.location.reload();
    } else {
        console.log('Failed to delete user');
    }
}

function displayUsers(users: IUser[]): void {
    const tbody: HTMLElement = document.getElementById('userTableBody') as HTMLElement;
    const addUserBtn : HTMLElement = <HTMLElement>document.getElementById('createUser');
    const tableHead:HTMLElement = document.getElementById('table-head')!;
    addUserBtn!.setAttribute('data-toggle', 'modal');
    addUserBtn!.setAttribute('data-target', '#addUserModal');
    createTable(tableHead,tbody,users,[deleteUser],true,["Delete"],["btn btn-danger"]);
}


async function postRequest(api:string,body:IBodyStructureForUserAPI):Promise<void>{
    const responseDataArray  = await executePostApi(api,body);
    const data = responseDataArray[1];
    if(!(responseDataArray[0].status >= 200 && responseDataArray[0].status < 300)){
        alert(data.message);
        return;
    }
    window.location.reload();
}

const addUserForm: HTMLFormElement = <HTMLFormElement>document.getElementById("addUserForm");
addUserForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    const formData:FormData = new FormData(addUserForm);
    const formValues: object = Object.fromEntries(formData);
    const getRole : HTMLElement = document.getElementById('role')!;
    if(formValues.phoneNumber.length != 10 || parseInt(formValues.phoneNumber)<0){
        alert("Please enter a valid phone number");
        location.reload();
    }
    const body:IBodyStructureForUserAPI = {
        username : formValues.username,
        firstName : formValues.firstName,
        lastName : formValues.lastName,
        email : formValues.email,
        role: [getRole.value],
        password : formValues.password,
        phoneNumber : parseInt(formValues.phoneNumber),
        dateOfBirth : formValues.dateOfBirth,
    }
    console.log(body);
    await postRequest(createUserViaAdminApi,body);
})