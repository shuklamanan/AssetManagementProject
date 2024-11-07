import fetchUserRoles from '../functions/fetchUserRoles.ts'
const commonApi:string = "http://localhost:5001";
if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

function displayContentBasedOnRoles(roles: string[]): void {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none"
    }
}

const roles : string[] = await fetchUserRoles();
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
async function fetchAssets() : Promise<void> {
    const getAssetApi : string = commonApi + "/assets/";
    const response : Response = await fetch(getAssetApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    assets = await response.json();
    console.log(assets);
    displayAssets(assets);
}

function displayAssets(assets: Asset[]) : void {
    const tbody : HTMLElement = document.getElementById('assetTableBody') as HTMLElement;

    assets.forEach(asset  => {
        const row : HTMLTableRowElement = document.createElement('tr');

        const idCell : HTMLTableCellElement = document.createElement('td');
        idCell.textContent = asset.id.toString();
        row.appendChild(idCell);

        const nameCell: HTMLTableCellElement = document.createElement('td');
        nameCell.textContent = asset.name;
        row.appendChild(nameCell);

        const typeCell : HTMLTableCellElement = document.createElement('td');
        typeCell.textContent = asset.asset_type;
        row.appendChild(typeCell);

        const ownerCell : HTMLTableCellElement = document.createElement('td');
        ownerCell.textContent = asset.username || 'Unassigned';
        row.appendChild(ownerCell);

        const openButtonCell : HTMLTableCellElement = document.createElement('td');
        const openButton : HTMLButtonElement = document.createElement('button');
        openButton.type = 'button';
        openButton.className = 'btn btn-primary';
        openButton.textContent = 'Open';
        openButton.setAttribute('data-toggle', 'modal');
        openButton.setAttribute('data-target', '#assetModal');
        openButton.onclick = () => openAsset(asset);
        openButtonCell.appendChild(openButton);
        row.appendChild(openButtonCell);

        const deleteButtonCell: HTMLTableCellElement = document.createElement('td');
        const deleteButton : HTMLButtonElement = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.type = 'button';
        deleteButton.setAttribute('data-toggle', 'modal');
        deleteButton.setAttribute('data-target', '#deleteModal');
        deleteButton.textContent = 'Delete';
        const confirmDeleteAssetBtn : HTMLButtonElement = <HTMLButtonElement>document.getElementById('confirmDeleteAssetBtn')!;
        confirmDeleteAssetBtn.onclick = () => deleteAsset(asset.id);
        deleteButtonCell.appendChild(deleteButton);
        row.appendChild(deleteButtonCell);
        tbody.appendChild(row);
        console.log(row)
    });

}

async function deleteAsset(id:number) : Promise<void> {
    const deleteAssetApi : string = commonApi + `/assets/${id}`;
    const response : Response = await fetch(deleteAssetApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        method: "DELETE"
    });
    assets = await response.json();
    console.log(assets);
    window.location.reload();
}

function openAsset(asset : Asset) : void {
    const modalAssetId:HTMLElement = document.getElementById("modalAssetId")!;
    const modalAssetName:HTMLElement = document.getElementById("modalAssetName")!;
    const modalAssetType:HTMLElement = document.getElementById("modalAssetType")!;
    const modalAssetOwner:HTMLElement = document.getElementById("modalAssetOwner")!;
    const tableBody : HTMLElement = document.getElementById('configTableBody')!;
    modalAssetId.textContent = asset.id.toString();
    modalAssetName.textContent = asset.name;
    modalAssetType.textContent = asset.asset_type;
    modalAssetOwner.textContent = asset.username || 'Unassigned';
    console.log(asset.config);
    for(let key in asset.config){
        const row : HTMLTableRowElement = document.createElement('tr');

        const objectKeyCell : HTMLTableCellElement = document.createElement('td');
        objectKeyCell.textContent = key;
        row.appendChild(objectKeyCell);

        const objectValueCell: HTMLTableCellElement = document.createElement('td');
        objectValueCell.textContent = asset.config[key];
        row.appendChild(objectValueCell);
        tableBody.appendChild(row);
    }
}

document.getElementById("logout").addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})