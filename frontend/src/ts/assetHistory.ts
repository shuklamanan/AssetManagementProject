import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IAssetHistory} from "../functions/interface.ts";
import {assetHistoryApi, headers} from "../functions/api.ts";

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
    const response: Response = await fetch(assetHistoryApi, {
        headers: headers,
    });
    let assets:IAssetHistory[] = await response.json()
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: IAssetHistory[]): void {
    const tbody : HTMLElement = <HTMLElement>document.querySelector('#assetHistoryTable tbody');
    tbody.innerHTML = '';
    assetHistory.forEach(entry => {
        const row: HTMLTableRowElement = document.createElement('tr');

        const usernameCell : HTMLTableCellElement = document.createElement('td');
        usernameCell.textContent = entry.username || 'N/A';
        row.appendChild(usernameCell);

        const assetNameCell : HTMLTableCellElement = document.createElement('td');
        assetNameCell.textContent = entry.assetName;
        row.appendChild(assetNameCell);

        const assignedAtCell : HTMLTableCellElement = document.createElement('td');
        assignedAtCell.textContent = entry.assignedAt
            ? new Date(entry.assignedAt).toLocaleString()
            : 'N/A';
        row.appendChild(assignedAtCell);

        const unassignedAtCell : HTMLTableCellElement = document.createElement('td');
        unassignedAtCell.textContent = entry.unassignedAt
            ? new Date(entry.unassignedAt).toLocaleString()
            : 'N/A';
        row.appendChild(unassignedAtCell);

        tbody.appendChild(row);
    });
}
await fetchAssetHistory()

