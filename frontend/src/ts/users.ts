import fetchUserRoles from '../functions/fetchUserRoles.ts'
const commonApi: string = "http://localhost:5001";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    email: string;
    phone_number: number;
    department: string | null;
    date_of_birth: string;
}

async function fetchUsers(): Promise<User[]> {
    const getUsersApi: string = commonApi + "/users";
    const response: Response = await fetch(getUsersApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}
let users:User[] = await fetchUsers()
displayUsers(users)
console.log(users)
document.getElementById("logout").addEventListener('click',()=>{
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

function displayUsers(users: User[]): void {
    const tbody: HTMLElement = document.getElementById('userTableBody') as HTMLElement;
    tbody.innerHTML = '';

    users.forEach(user => {
        const row: HTMLTableRowElement = document.createElement('tr');

        const cells = [
            user.username,
            user.first_name,
            user.last_name,
            user.role,
            user.email,
            user.phone_number,
            user.department || 'N/A',
            new Date(user.date_of_birth).toLocaleDateString()
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


