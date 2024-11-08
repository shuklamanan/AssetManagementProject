import fetchUserRoles from '../functions/fetchUserRoles.ts'
import IAsset, {IUser} from "../functions/interfaces.ts";
const commonApi:string = "http://localhost:5001";
if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

function displayContentBasedOnRoles(roles: string[]): void {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none"
        document.getElementById("asset-history-nav")!.style.display = "none"
    }
}

const roles : string[] = await fetchUserRoles();
displayContentBasedOnRoles(roles);
fetchAssets()

let assets: IAsset[] = [];
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

function displayAssets(assets: IAsset[]) : void {
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
        openButton.setAttribute("id","openButton");
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

function createAssignUnassignBtn(htmlNode:HTMLElement,idName:string,className:string) : HTMLElement {
    htmlNode.setAttribute('id',idName);
    htmlNode.setAttribute('class',className);
    return htmlNode;
}

function addAssignUnassignButtons(asset:IAsset) : HTMLElement{
    const div : HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('div'),"","modal-footer");
    const assignBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"assetAssignBtn","btn btn-primary");
    assignBtn.textContent = 'Assign';
    const unassignBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"assetUnassignBtn","btn btn-danger");
    unassignBtn.textContent = 'Unassign';
    const closeBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"close","btn btn-secondary");
    closeBtn.setAttribute('data-dismiss', 'modal');
    closeBtn.textContent = 'Close';
    div.appendChild(assignBtn);
    div.appendChild(unassignBtn);
    div.appendChild(closeBtn);
    if(asset.username){
        assignBtn.style.display = "none";
    }
    else{
        unassignBtn.style.display = "none";
    }

    assignBtn.onclick = () => assetAssignToUser(asset.id.toString());
    unassignBtn.onclick = () => assetUnassign(asset.id.toString());
    return div;
}

async function assetAssignToUser(id:string) : Promise<void>{
    const assetAssignApi : string = commonApi + `/assets/assign`;
    const user: HTMLElement = document.getElementById('users')!;
    let userId;
    const username = user!.value;
    for(let i : number=0;i<users.length;i++){
        if(users[i].username == username){
            userId = users[i].id;
            break;
        }
    }
    console.log(id,userId);
    const response : Response = await fetch(assetAssignApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "assetId":id,
            "userId":userId
        }),
        method: "POST"
    });
    if(response.status == 201){
        window.location.reload();
    }
}

async function openAsset(asset : IAsset) : Promise<void> {
    const assignUnassignCloseBtnBody : HTMLElement = document.getElementById("assignUnassignCloseBtnBody")!;
    const modalAssetId:HTMLElement = document.getElementById("modalAssetId")!;
    const modalAssetName:HTMLElement = document.getElementById("modalAssetName")!;
    const modalAssetType:HTMLElement = document.getElementById("modalAssetType")!;
    const modalAssetOwner:HTMLElement = document.getElementById("modalAssetOwner")!;
    const tableBody : HTMLElement = document.getElementById('configTableBody')!;
    const dropdownForUsers : HTMLElement = document.getElementById('dropDownForUsers')!;
    dropdownForUsers.innerHTML="";
    modalAssetId.textContent = asset.id.toString();
    modalAssetName.textContent = asset.name;
    modalAssetType.textContent = asset.asset_type;
    modalAssetOwner.textContent = asset.username || 'Unassigned';
    console.log(asset.config);
    tableBody.innerHTML="";
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
    assignUnassignCloseBtnBody.innerHTML ="";
    const divElement : HTMLElement = addAssignUnassignButtons(asset);
    if(!asset.username) {
        const assetAssignToUser: HTMLElement | null= document.getElementById('assetAssignToUser');
        if(assetAssignToUser){
            assetAssignToUser.parentNode!.removeChild(assetAssignToUser);
        }
        await getDataOfUser(dropdownForUsers)
    }
    assignUnassignCloseBtnBody.appendChild(divElement);
    console.log(asset.username);
}
let users: IUser[];
async function getDataOfUser(dropdownForUsers:HTMLElement) :Promise<void>{
    const allUserApi : string = commonApi + '/users';
    let selectTag : HTMLSelectElement = document.createElement('select');
    const response : Response = await fetch(allUserApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    users = await response.json();
    console.log(users);
    selectTag.setAttribute('name','users');
    selectTag.setAttribute('id','users');
    for(let i:number=0;i<users.length;i++){
        const optionTag :HTMLOptionElement = document.createElement('option');
        optionTag.setAttribute('value',users[i].username);
        optionTag.textContent = users[i].username;
        selectTag.appendChild(optionTag);
    }
    dropdownForUsers.appendChild(selectTag);
    console.log(selectTag);
    console.log(dropdownForUsers);
}

async function assetUnassign(id:string) : Promise<void>{
    const assetUnassignApi : string = commonApi + `/assets/unassign/${id}`;
    await fetch(assetUnassignApi, {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        method: "POST"
    });
    console.log(assets);
    window.location.reload();
}

document.getElementById("logout")!.addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})