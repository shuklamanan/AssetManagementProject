import fetchUserRoles from '../functions/fetchUserRoles.ts'
const commonApi: string = "http://localhost:5001";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

document.getElementById("logout").addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})
export interface AssetHistory {
    user_id: string | null;
    username: string | null;
    asset_id: number;
    asset_name: string;
    assigned_at: string | null;
    unassigned_at: string | null;
}

async function fetchAssetHistory(): Promise<void> {
    const response = await fetch(`${commonApi}/assets/history`, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`
        }
    });
    let assets:AssetHistory[] = await response.json()
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: AssetHistory[]): void {
    const tbody = document.querySelector('#assetHistoryTable tbody') as HTMLElement;
    tbody.innerHTML = '';

    assetHistory.forEach(entry => {
        const row = document.createElement('tr');

        const usernameCell = document.createElement('td');
        usernameCell.textContent = entry.username || 'N/A';
        row.appendChild(usernameCell);

        const assetNameCell = document.createElement('td');
        assetNameCell.textContent = entry.asset_name;
        row.appendChild(assetNameCell);

        const assignedAtCell = document.createElement('td');
        assignedAtCell.textContent = entry.assigned_at
            ? new Date(entry.assigned_at).toLocaleString()
            : 'N/A';
        row.appendChild(assignedAtCell);

        const unassignedAtCell = document.createElement('td');
        unassignedAtCell.textContent = entry.unassigned_at
            ? new Date(entry.unassigned_at).toLocaleString()
            : 'N/A';
        row.appendChild(unassignedAtCell);

        tbody.appendChild(row);
    });
}
fetchAssetHistory()

