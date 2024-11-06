import fetchUserRoles from '../functions/fetchUserRoles.ts'

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

function displayContentBasedOnRoles(roles: string[]): void {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav").style.display = "none"
    }
}

const roles = await fetchUserRoles();
displayContentBasedOnRoles(roles);
fetchAssets()
interface Asset {
    id: number;
    name: string;
    asset_type: string;
    username: string | null;
    config: Record<string, string>;
}
let assets: Asset[] = [];
async function fetchAssets() {
    const response = await fetch('http://localhost:5001/assets', {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    assets = await response.json();
    displayAssets(assets);
}

function displayAssets(assets: Asset[]) {
    const tbody = document.getElementById('assetTableBody') as HTMLElement;

    assets.forEach(asset => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = asset.id.toString();
        row.appendChild(idCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = asset.name;
        row.appendChild(nameCell);

        const typeCell = document.createElement('td');
        typeCell.textContent = asset.asset_type;
        row.appendChild(typeCell);

        const ownerCell = document.createElement('td');
        ownerCell.textContent = asset.username || 'Unassigned';
        row.appendChild(ownerCell);

        const openButtonCell = document.createElement('td');
        const openButton = document.createElement('button');
        openButton.className = 'btn btn-primary';
        openButton.textContent = 'Open';
        openButton.setAttribute('data-bs-toggle', 'modal');
        openButton.setAttribute('data-bs-target', '#assetModal');
        openButton.onclick = () => openAsset(asset.id);
        openButtonCell.appendChild(openButton);
        row.appendChild(openButtonCell);

        const deleteButtonCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteAsset(asset.id);
        deleteButtonCell.appendChild(deleteButton);
        row.appendChild(deleteButtonCell);

        tbody.appendChild(row);
        console.log(row)
    });

}

function deleteAsset(assetId: number) {
    document.getElementById(`${assetId}`)?.remove()
}







