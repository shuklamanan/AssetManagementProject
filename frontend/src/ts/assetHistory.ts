import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IAssetHistory} from "../functions/interface.ts";
import {assetHistoryApi} from "../functions/api.ts";
import {executeGetApi} from "./apiExecution.ts";

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

function appendChildToParent(parentNode: HTMLElement, ...childNodes: HTMLElement[]): HTMLElement {
    for (const child of childNodes) {
        parentNode.appendChild(child);
    }
    return parentNode;
}


async function fetchAssetHistory(): Promise<void> {
    const responseAnswerArray  = await executeGetApi(assetHistoryApi);
    let assets:IAssetHistory[] = responseAnswerArray[1];
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: IAssetHistory[]): void {
    let tbody : HTMLElement = <HTMLElement>document.getElementById('asset-history');
    tbody.innerHTML = '';
    assetHistory.forEach(entry => {
        let row: HTMLElement = document.createElement('tr');

        const usernameCell : HTMLElement = document.createElement('td');
        usernameCell.textContent = entry.username || 'N/A';

        const assetNameCell : HTMLElement = document.createElement('td');
        assetNameCell.textContent = entry.assetName;

        const assignedAtCell : HTMLElement = document.createElement('td');
        assignedAtCell.textContent = entry.assignedAt
            ? new Date(entry.assignedAt).toLocaleString()
            : 'N/A';

        const unassignedAtCell : HTMLElement = document.createElement('td');
        unassignedAtCell.textContent = entry.unassignedAt
            ? new Date(entry.unassignedAt).toLocaleString()
            : 'N/A';
        row = appendChildToParent(row,usernameCell,assetNameCell,assignedAtCell,unassignedAtCell);

        tbody.appendChild(row);
    });
}
await fetchAssetHistory()

