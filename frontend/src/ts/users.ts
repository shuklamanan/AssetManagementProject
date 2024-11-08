import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IBodyStructureForUserAPI} from "../functions/interface.ts";
import {createUserViaAdminApi, deleteUserApi, getAllUsersApi, headers} from "../functions/api.ts";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles:string[] = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

interface IUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string[];
    email: string;
    phoneNumber: number;
    department: string | null;
    dateOfBirth: string;
}

async function fetchUsers(): Promise<IUser[]> {
    const response: Response = await fetch(getAllUsersApi, {
        headers:headers
    });
    return await response.json();
}
let users:IUser[] = await fetchUsers()
displayUsers(users)
console.log(users)
document.getElementById("logout")!.addEventListener('click',() : void=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})

async function deleteUser(userId: number): Promise<void> {
    const deleteUser: string = deleteUserApi + `${userId}`;
    const response: Response = await fetch(deleteUser, {
        headers: headers,
        method: "DELETE"
    });
    if (response.ok) {
        console.log(`User ${userId} deleted successfully`);
       users = await fetchUsers();
       displayUsers(users)
    } else {
        console.log('Failed to delete user');
    }
}

function displayUsers(users: IUser[]): void {
    const tbody: HTMLElement = document.getElementById('userTableBody') as HTMLElement;
    const addUserBtn : HTMLElement = <HTMLElement>document.getElementById('createUser');
    addUserBtn!.setAttribute('data-toggle', 'modal');
    addUserBtn!.setAttribute('data-target', '#addUserModal');
    tbody.innerHTML = '';
    console.log(users);
    users.forEach(user => {
        const row: HTMLTableRowElement = document.createElement('tr');

        const cells = [
            user.username,
            user.firstName,
            user.lastName,
            user.role,
            user.email,
            user.phoneNumber,
            user.department || 'N/A',
            new Date(user.dateOfBirth).toLocaleDateString()
        ];

        cells.forEach(cellText => {
            const cell: HTMLTableCellElement = document.createElement('td');
            cell.textContent = String(cellText);
            row.appendChild(cell);
        });

        const deleteButtonCell: HTMLTableCellElement = document.createElement('td');
        const deleteButton: HTMLButtonElement = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteUser(user.id);

        deleteButtonCell.appendChild(deleteButton);
        row.appendChild(deleteButtonCell);
        tbody.appendChild(row);
    });
}


async function postRequest(api:string,body:IBodyStructureForUserAPI):Promise<void>{
    const res : Response  = await fetch(api, {
        method:"POST",
        headers:headers,
        body:JSON.stringify(body)
    });
    const data = await res.json();
    if(!(res.status >= 200 && res.status < 300)){
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