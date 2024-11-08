import fetchUserRoles from '../functions/fetchUserRoles.ts'
const commonApi: string = "http://localhost:5001";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

interface IUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phoneNumber: number;
    department: string | null;
    dateOfBirth: string;
}

async function fetchUsers(): Promise<IUser[]> {
    const getUsersApi: string = commonApi + "/users";
    const response: Response = await fetch(getUsersApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}
let users:IUser[] = await fetchUsers()
displayUsers(users)
console.log(users)
document.getElementById("logout")!.addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})

async function deleteUser(userId: number): Promise<void> {
    const deleteUserApi: string = commonApi + `/users/${userId}`;
    const response: Response = await fetch(deleteUserApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
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
    tbody.innerHTML = '';

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


