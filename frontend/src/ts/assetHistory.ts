import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IAssetHistory} from "../functions/interface.ts";
const commonApi: string = "http://localhost:5001";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles : string[] = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

document.getElementById("logout")!.addEventListener('click',() : void=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})

async function fetchAssetHistory(): Promise<void> {
    const response: Response = await fetch(`${commonApi}/assets/history`, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`
        }
    });
    let assets:IAssetHistory[] = await response.json()
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: IAssetHistory[]): void {
    const tbody : HTMLElement = document.querySelector('#assetHistoryTable tbody') as HTMLElement;
    tbody.innerHTML = '';
    // console.log(assetHistory)
    assetHistory.forEach(entry => {
        const row: HTMLTableRowElement = document.createElement('tr');

        const usernameCell : HTMLTableCellElement = document.createElement('td');
        usernameCell.textContent = entry.username || 'N/A';
        row.appendChild(usernameCell);

        const assetNameCell : HTMLTableCellElement = document.createElement('td');
        assetNameCell.textContent = entry.asset_name;
        row.appendChild(assetNameCell);

        const assignedAtCell : HTMLTableCellElement = document.createElement('td');
        assignedAtCell.textContent = entry.assigned_at
            ? new Date(entry.assigned_at).toLocaleString()
            : 'N/A';
        row.appendChild(assignedAtCell);

        const unassignedAtCell : HTMLTableCellElement = document.createElement('td');
        unassignedAtCell.textContent = entry.unassigned_at
            ? new Date(entry.unassigned_at).toLocaleString()
            : 'N/A';
        row.appendChild(unassignedAtCell);

        tbody.appendChild(row);
    });
}
await fetchAssetHistory()

