import fetchUserRoles from '../functions/fetchUserRoles.ts'
import IAsset, {IUser} from "../functions/interface.ts";
import {
    assetAssignApi, assetUnassignApi,
    createAssetApi,
    deleteAssetApi,
    getAllAssetsApi,
    getAllUsersApi,
    getRolesApi, headers
} from "../functions/api.ts";

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

let assets: IAsset[] = [];

async function checkAdminOrNot() : Promise<boolean>{
    const response : Response = await fetch(getRolesApi,{
        headers: headers,
    });
    const roleArray : string[] = await response.json();
    console.log(roleArray);
    console.log("--",roleArray.includes('Admin'))
    return roleArray.includes("Admin");
}

let users: IUser[];
async function getDataOfUser(dropdownForUsers:HTMLElement) :Promise<void>{
    let selectTag : HTMLSelectElement = document.createElement('select');
    const response : Response = await fetch(getAllUsersApi, {
        headers: headers,
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

async function fetchAssets() : Promise<void> {
    const response : Response = await fetch(getAllAssetsApi, {
        headers: headers,
    });
    assets = await response.json();
    console.log(assets);
    await displayAssets(assets);
}
await fetchAssets()

function createOpenAndCloseButtons(className:string,idName:string,targetModal:string,buttonContent:string) : HTMLTableCellElement{
    const buttonCell : HTMLTableCellElement = document.createElement('td');
    const button : HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.setAttribute("id",idName);
    button.className = className;
    button.textContent = buttonContent;
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', targetModal);
    buttonCell.appendChild(button);
    return buttonCell;
}

async function displayAssets(assets: IAsset[]) : Promise<void> {
    const tbody : HTMLElement = document.getElementById('assetTableBody') as HTMLElement;
    const addAssetBtn: HTMLElement | null = document.getElementById('createAssets');
    const isAdmin : boolean = await checkAdminOrNot();
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

        const openButtonCell : HTMLTableCellElement = createOpenAndCloseButtons('btn btn-primary',"openButton",'#assetModal','Open');
        openButtonCell.firstChild!.onclick = () => openAsset(asset);
        row.appendChild(openButtonCell);
        if(isAdmin) {
            const deleteButtonCell : HTMLTableCellElement = createOpenAndCloseButtons('btn btn-danger',"deleteButton",'#deleteModal','Delete');
            const confirmDeleteAssetBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('confirmDeleteAssetBtn')!;
            confirmDeleteAssetBtn.onclick = () => deleteAsset(asset.id);
            row.appendChild(deleteButtonCell);
        }
        tbody.appendChild(row);
        console.log(row)
    });
    if(isAdmin){
        const dropdownForAssetAssign:HTMLElement = document.createElement('div')
        const addAssetAssetName: HTMLElement = document.getElementById('addAssetAssetName')!;
        console.log(addAssetAssetName.value);
        addAssetAssetName.value = "";
        await getDataOfUser(dropdownForAssetAssign);
        addAssetBtn!.setAttribute('data-toggle', 'modal');
        addAssetBtn!.setAttribute('data-target', '#addAssetModal');
        addAssetBtn!.onclick = () => enterAssetDetails(dropdownForAssetAssign);
    }
    else{
        if(addAssetBtn) {
            addAssetBtn.parentNode!.removeChild(addAssetBtn);
        }
        console.log(isAdmin);
        const closeColumn : HTMLElement | null = document.getElementById('closeColumn');
        if(closeColumn){
            closeColumn.parentNode!.removeChild(closeColumn);
        }
    }
}

function addAssetAssignDropDown(dropdown:HTMLElement):void{
    const addAssetDropDownForUsers :HTMLElement = document.getElementById("addAssetDropDownForUsers")!;
    const tableBody:HTMLElement = document.getElementById('addAssetConfigTableBody')!;
    tableBody.innerHTML = "";
    addAssetDropDownForUsers.innerHTML = "";
    console.log(dropdown!.firstChild!.childNodes);
    let noUserPresent:boolean = false;
    (dropdown!.firstChild!.childNodes).forEach(option  => {
        if(option.value == "noUser"){
            noUserPresent = true;
        }
    })
    if(!noUserPresent) {
        const optionTag: HTMLOptionElement = document.createElement('option');
        optionTag.selected = true;
        optionTag.setAttribute('value', 'noUser')
        optionTag.textContent = "No User";
        dropdown!.firstChild!.appendChild(optionTag);
    }
    addAssetDropDownForUsers.appendChild(dropdown);
}

function addRow() : void{
    const tableBody:HTMLElement = document.getElementById('addAssetConfigTableBody')!;
    const newRow : HTMLTableRowElement = document.createElement('tr');

    const idCell : HTMLTableCellElement = document.createElement('td');
    idCell.innerHTML = "<input type='text' class='addAssetConfigDetails'>"
    newRow.appendChild(idCell);

    const nameCell: HTMLTableCellElement = document.createElement('td');
    nameCell.innerHTML = "<input type='text' class='addAssetConfigDetails'>"
    newRow.appendChild(nameCell);

    tableBody.appendChild(newRow);
}

async function addAsset(dropdown:HTMLElement):Promise<void> {
    const getConfigDetail = document.getElementsByTagName('input');
    const assetType : HTMLElement = document.getElementById('assetType')!;
    let configObj : Record<string, string> = {};
    for(let i : number=1;i<getConfigDetail.length;i+=2){
        configObj[getConfigDetail[i].value] = getConfigDetail[i+1].value;
    }
    const assignUser : string | undefined = (dropdown!.firstChild!.value == "noUser") ? undefined : dropdown!.firstChild!.value;
    const addAssetApiBody : Record<string,string | Record<string,string>> = {
        "name": getConfigDetail[0].value,
        "assetType": assetType.value,
        "config": configObj
    }
    if(assignUser){
        const userId:number | undefined = getIdFromUsername(<HTMLElement>dropdown!.firstChild);
        console.log(userId);
        if(userId){
            addAssetApiBody["userId"] = userId.toString();
        }
    }
    const response :Response = await fetch(createAssetApi,{
        headers : headers,
        method : 'POST',
        body: JSON.stringify(addAssetApiBody)
    });
    if(response.status == 201){
        window.location.reload();
    }
}

function enterAssetDetails(dropdown:HTMLElement) : void {
    addAssetAssignDropDown(dropdown);
    const addRowBtn:HTMLElement =  document.getElementById('addRowBtn')!;
    addRowBtn.addEventListener('click',addRow)
    const addAssetBtn : HTMLElement = document.getElementById('addAssetBtn')!;
    addAssetBtn!.onclick = () => addAsset(dropdown);
}

async function deleteAsset(id:number) : Promise<void> {
    console.log(id);
    const assetDeleteApi:string = deleteAssetApi + `${id}`;
    const response : Response = await fetch(assetDeleteApi, {
        headers: headers,
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
    div.appendChild(assignBtn);
    div.appendChild(unassignBtn);
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

function getIdFromUsername(user : HTMLElement) : number | undefined{
    const username = user!.value;
    for(let i : number=0;i<users.length;i++){
        if(users[i].username == username){
            return users[i].id;
        }
    }
    return undefined;
}

async function assetAssignToUser(id:string) : Promise<void>{
    const user: HTMLElement = document.getElementById('users')!;
    const userId : number | undefined = getIdFromUsername(user);
    console.log(id,userId);
    const response : Response = await fetch(assetAssignApi, {
        headers: headers,
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
    const closeBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"close","btn btn-secondary");
    closeBtn.setAttribute('data-dismiss', 'modal');
    closeBtn.textContent = 'Close';
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
    let divElementForButtons : HTMLElement = document.createElement('div');
    const isAdmin : boolean = await checkAdminOrNot();
    console.log(isAdmin)
    if(isAdmin) {
        const divElement: HTMLElement = addAssignUnassignButtons(asset);
        if (!asset.username) {
            const assetAssignToUser: HTMLElement | null = document.getElementById('assetAssignToUser');
            if (assetAssignToUser) {
                assetAssignToUser.parentNode!.removeChild(assetAssignToUser);
            }
            await getDataOfUser(dropdownForUsers)
        }
        divElementForButtons.appendChild(divElement);
    }
    const divForClose : HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('div'),"","modal-footer");
    divForClose.appendChild(closeBtn);
    divElementForButtons.appendChild(divForClose)
    assignUnassignCloseBtnBody.appendChild(divElementForButtons);
    console.log(asset.username);
}

async function assetUnassign(id:string) : Promise<void>{
    const unassignAssetApi : string = assetUnassignApi + `${id}`;
    await fetch(unassignAssetApi, {
        headers: headers,
        method: "POST"
    });
    console.log(assets);
    window.location.reload();
}

document.getElementById("logout")!.addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})