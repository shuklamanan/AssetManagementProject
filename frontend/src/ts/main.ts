import fetchUserRoles from '../functions/fetchUserRoles.ts'
import IAsset, {IUser} from "../functions/interface.ts";
import {
    assetAssignApi, assetUnassignApi,
    createAssetApi,
    deleteAssetApi,
    getAllAssetsApi,
    getAllUsersApi,
    getRolesApi, headers, updateAssetApi
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
            deleteButtonCell.onclick = () => deleteAsset(asset.id);
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
    idCell.innerHTML = "<input type='text' class='addAssetConfigDetails' required>"
    newRow.appendChild(idCell);

    const nameCell: HTMLTableCellElement = document.createElement('td');
    nameCell.innerHTML = "<input type='text' class='addAssetConfigDetails' required>"
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
        const userId:number | undefined = getIdFromUsername(dropdown!.firstChild!.value);
        console.log(userId);
        addAssetApiBody["userId"] = userId!.toString();
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
    const editBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"assetEditBtn","btn btn-primary");
    editBtn.textContent = 'Edit';
    const saveBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"assetEditBtn","btn btn-primary");
    saveBtn.textContent = 'Save';
    const unassignBtn: HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"assetUnassignBtn","btn btn-danger");
    unassignBtn.textContent = 'Unassign';
    const addRowDiv:HTMLElement = <HTMLElement>document.getElementById('addRowForEdit');
    addRowDiv.innerHTML = "";
    div.appendChild(assignBtn);
    div.appendChild(unassignBtn);
    div.appendChild(editBtn);
    console.log(asset);
    if(asset.username){
        assignBtn.style.display = "none";
    }
    else{
        unassignBtn.style.display = "none";
    }
    editBtn.onclick = () => editAssets(asset,saveBtn,div,editBtn);
    assignBtn.onclick = () => assetAssignToUser(asset.id.toString());
    unassignBtn.onclick = () => assetUnassign(asset.id.toString());
    return div;
}

function addRowInEditSection() : void{
    const tableBody:HTMLElement = document.getElementById('configTableBody')!;
    const newRow : HTMLTableRowElement = document.createElement('tr');

    const idCell : HTMLTableCellElement = document.createElement('td');
    idCell.innerHTML = "<input type='text' class='editAssetConfigDetails' required>"
    newRow.appendChild(idCell);

    const nameCell: HTMLTableCellElement = document.createElement('td');
    nameCell.innerHTML = "<input type='text' class='editAssetConfigDetails' required>"
    newRow.appendChild(nameCell);

    tableBody.appendChild(newRow);
}

async function saveAssetDetails(tableBody:HTMLElement) : Promise<void> {
    const id :string = document.getElementById('modalAssetId')!.textContent!;
    const name : HTMLElement = document.getElementById('editAssetName')!;
    const assetType : HTMLElement = document.getElementById('editAssetType')!;
    const editAssetConfigDetails:HTMLCollectionOf<Element> = tableBody.getElementsByTagName('input');
    const assignedAssetOrNot:HTMLElement = document.getElementById('modalAssetOwner')!;
    let configObj : Record<string, string> = {};
    for(let i:number =0;i<editAssetConfigDetails.length;i+=2){
        if(editAssetConfigDetails[i].value.trim().length && editAssetConfigDetails[i+1].value.trim().length){
            configObj[editAssetConfigDetails[i].value] = editAssetConfigDetails[i+1].value;
        }
    }
    let editAssetApiBody: Record<string,string | Record<string,string>> = {
        "name": name.value,
        "assetType": assetType.value,
        "config": configObj
    };
    if(assignedAssetOrNot.textContent!='Unassigned'){
        const userId:number | undefined = getIdFromUsername(assignedAssetOrNot.textContent!);
        editAssetApiBody["userId"] = userId!.toString();
    }
    console.log(editAssetApiBody);
    const updateApi : string = updateAssetApi + `${id}`;
    const response :Response = await fetch(updateApi,{
        headers : headers,
        method : 'PUT',
        body: JSON.stringify(editAssetApiBody)
    });
    if(response.status == 200){
        window.location.reload();
    }
}

function convertTdCellToInput(tableBody:HTMLElement) : void {
    const tableDataCells:HTMLCollectionOf<Element> = tableBody.getElementsByTagName('td');
    console.log(tableDataCells);
    for(let i : number=0;i<tableDataCells.length ;i++){
        const value : string = tableDataCells[i].textContent!;
        tableDataCells[i].innerHTML = `<input type='text' class='editAssetConfigDetails' value="${value}">`;
    }
}

function editAssets(asset:IAsset,saveBtn : HTMLElement,div:HTMLElement,editBtn:HTMLElement) : void {
    const userDropdown:HTMLElement = document.getElementById('dropDownForUsers')!;
    const addRowDiv:HTMLElement = <HTMLElement>document.getElementById('addRowForEdit');
    const addRowBtnInEditSection : HTMLElement = createAssignUnassignBtn(<HTMLElement>document.createElement('button'),"addRowInEditSection","btn btn-primary");
    const assetName:HTMLElement = document.getElementById('modalAssetName')!;
    const assetType:HTMLElement =document.getElementById('modalAssetType')!;
    const tableBody:HTMLElement = document.getElementById('configTableBody')!;
    userDropdown.innerHTML = "";
    div.removeChild(editBtn);
    div.appendChild(saveBtn);
    saveBtn.onclick = () => saveAssetDetails(tableBody);
    addRowBtnInEditSection.innerHTML = "+";
    addRowBtnInEditSection.onclick = () => addRowInEditSection();
    addRowDiv.appendChild(addRowBtnInEditSection);
    assetName.innerHTML = `<input type="text" value=${asset.name} id="editAssetName" required>`;
    console.log(assetName)
    assetType.innerHTML = `<select id="editAssetType">
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                </select>`;
    const tableData:HTMLCollectionOf<Element>  = document.getElementsByClassName('addAssetConfigDetails')!;
    console.log(tableBody)
    convertTdCellToInput(tableBody);
}

function getIdFromUsername(username : string) : number | undefined{
    for(let i : number=0;i<users.length;i++){
        if(users[i].username == username){
            return users[i].id;
        }
    }
    return undefined;
}

async function assetAssignToUser(id:string) : Promise<void>{
    const user: HTMLElement = document.getElementById('users')!;
    const userId : number | undefined = getIdFromUsername(user!.value);
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