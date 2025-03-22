import fetchUserRoles from '../functions/fetchUserRoles.ts'
import IAsset, {IUser} from "../functions/interface.ts";
import {
    assetAssignApi,
    assetPendingApi,
    assetRequestApi,
    assetUnassignApi,
    createAssetApi,
    deleteAssetApi,
    getAllAssetsApi,
    getAllUsersApi,
    getRolesApi,
    updateAssetApi
} from "../functions/api.ts";
import {executeDeleteApi, executeGetApi, executePostApi, executePutApi} from "./apiExecution.ts";
import {isTokenAvailableOrNot, logout} from "../functions/helperFunctions.ts";

const logoutButton: HTMLElement = document.getElementById("logout")!;

isTokenAvailableOrNot();

function displayContentBasedOnRoles(roles: string[]): void {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none"
        document.getElementById("asset-history-nav")!.style.display = "none"
        document.getElementById("asset-request-nav")!.style.display = "none";
    }
}

function appendChildToParent(parentNode: HTMLElement, ...childNodes: HTMLElement[]): HTMLElement {
    for (const child of childNodes) {
        parentNode.appendChild(child);
    }
    return parentNode;
}

const roles: string[] = await fetchUserRoles();
displayContentBasedOnRoles(roles);

let assets: IAsset[] = [];

async function checkAdminOrNot(): Promise<boolean> {
    const responseDataArray = await executeGetApi(getRolesApi);
    const roleArray = responseDataArray[1];
    console.log(roleArray);
    return roleArray.includes("Admin");
}

let users: IUser[];

async function getDataOfUser(dropdownForUsers: HTMLElement): Promise<void> {
    let selectTag :HTMLElement = document.createElement('select');
    const responseDataArray = await executeGetApi(getAllUsersApi);
    users = responseDataArray[1];
    selectTag.setAttribute('name', 'users');
    selectTag.setAttribute('id', 'users');
    for (let i: number = 0; i < users.length; i++) {
        const optionTag: HTMLOptionElement = document.createElement('option');
        optionTag.setAttribute('value', users[i].username);
        optionTag.textContent = users[i].username;
        selectTag = appendChildToParent(selectTag, optionTag);
    }
    dropdownForUsers = appendChildToParent(dropdownForUsers, selectTag);
}

async function fetchAssets(): Promise<void> {
    const responseDataArray = await executeGetApi(getAllAssetsApi);
    console.log(responseDataArray);
    assets = responseDataArray[1];
    console.log(assets);
    await displayAssets(assets);
}

await fetchAssets()

export function createButtons(htmlNode: HTMLElement | HTMLButtonElement, idName: string, className: string): HTMLElement | HTMLButtonElement {
    htmlNode.setAttribute('id', idName);
    htmlNode.setAttribute('class', className);
    return htmlNode;
}

export function createButtons2(htmlNode: HTMLButtonElement, idName: string, className: string): HTMLButtonElement {
    htmlNode.setAttribute('id', idName);
    htmlNode.setAttribute('class', className);
    return htmlNode;
}

function createOpenAndCloseButtons(className: string, idName: string, targetModal: string, buttonContent: string, disabled = false): HTMLElement {
    let buttonCell: HTMLElement = document.createElement('td');
    const button: HTMLButtonElement = createButtons2(document.createElement('button'), idName, className);
    button.type = 'button';
    button.textContent = buttonContent;
    button.setAttribute('data-toggle', 'modal');
    button.setAttribute('data-target', targetModal);
    buttonCell = appendChildToParent(buttonCell, button);
    if (disabled) {
        button.disabled = true
    }
    return buttonCell;
}

async function pendingRequests(asset: IAsset): Promise<boolean> {
    console.log(asset);
    const pendingAssetsApi: string = assetPendingApi + `${asset.id}`;
    const responseDataArray = await executeGetApi(pendingAssetsApi);
    const res = responseDataArray[1];
    return res.message == "Your request is still pending";
}

async function displayAssets(assets: IAsset[]): Promise<void> {
    let tbody: HTMLElement = document.getElementById('assetTableBody') as HTMLElement;
    const addAssetBtn: HTMLElement | null = document.getElementById('createAssets');
    const isAdmin: boolean = await checkAdminOrNot();
    console.log(assets);
    for (const asset of assets) {
        let row: HTMLElement = document.createElement('tr');

        const idCell: HTMLElement = document.createElement('td');
        idCell.textContent = asset.id.toString();

        const nameCell: HTMLElement = document.createElement('td');
        nameCell.textContent = asset.name;

        const typeCell: HTMLElement = document.createElement('td');
        typeCell.textContent = asset.assetType;

        const ownerCell: HTMLElement = document.createElement('td');
        ownerCell.textContent = 'Unassigned';
        const openButtonCell: any = createOpenAndCloseButtons('btn btn-primary', "openButton", '#assetModal', 'Open');
        const openButton: any = openButtonCell.firstChild!
        openButton!.onclick = () => openAsset(asset);
        if (isAdmin) {
            const deleteButtonCell: any = createOpenAndCloseButtons('btn btn-danger', "deleteButton", '#deleteModal', 'Delete');
            deleteButtonCell!.firstChild!.onclick = () => deleteAsset(asset.id);
            ownerCell.textContent = asset.username || "Unassigned";
            row = appendChildToParent(row, idCell, nameCell, typeCell, ownerCell, openButtonCell, deleteButtonCell);
        } else {
            const pendingRequestOrNot: boolean = await pendingRequests(asset);
            const requestButtonCell: any = createOpenAndCloseButtons('btn btn-secondary', "requestButton", '#requestModal', 'Request Asset');
            if (asset.username) {
                ownerCell.textContent = 'You';
                requestButtonCell.textContent = '';
                requestButtonCell!.disabled = true;
            } else {
                if (pendingRequestOrNot) {
                    requestButtonCell.textContent = 'Pending...';
                    requestButtonCell!.disabled = true;
                } else {
                    requestButtonCell!.firstChild!.onclick = () => requestAsset(asset.id);
                }
            }
            row = appendChildToParent(row, idCell, nameCell, typeCell, ownerCell, openButtonCell, requestButtonCell);
        }
        tbody = appendChildToParent(tbody, row);
    }
    if (isAdmin) {
        await openModal(addAssetBtn!);
        const requestColumn: HTMLElement | null = document.getElementById('requestColumn');
        if (requestColumn) {
            requestColumn.parentNode!.removeChild(requestColumn);
        }
    } else {
        if (addAssetBtn) {
            addAssetBtn.parentNode!.removeChild(addAssetBtn);
        }
        const closeColumn: HTMLElement | null = document.getElementById('closeColumn');
        if (closeColumn) {
            closeColumn.parentNode!.removeChild(closeColumn);
        }
    }
}

async function openModal(openModalButton: HTMLElement) {
    const dropdownForAssetAssign: HTMLElement = document.createElement('div')
    const addAssetAssetName: HTMLElement = document.getElementById('addAssetAssetName')!;
    addAssetAssetName.textContent = "";
    await getDataOfUser(dropdownForAssetAssign);
    openModalButton!.setAttribute('data-toggle', 'modal');
    openModalButton!.setAttribute('data-target', '#addAssetModal');
    openModalButton!.onclick = () => enterAssetDetails(dropdownForAssetAssign);
}

function addAssetAssignDropDown(dropdown: HTMLElement): void {
    const addAssetDropDownForUsers = document.getElementById("addAssetDropDownForUsers")! as HTMLSelectElement;
    const tableBody: HTMLElement = document.getElementById('addAssetConfigTableBody')!;
    tableBody.innerHTML = "";
    addAssetDropDownForUsers.innerHTML = "";
    let noUserPresent: boolean = false;
    const firstChild = dropdown.firstChild as HTMLSelectElement
    (firstChild.childNodes).forEach(op => {
        const option = op as HTMLOptionElement
        if (option.value == "noUser") {
            noUserPresent = true;
        }
    })
    if (!noUserPresent) {
        const optionTag: HTMLOptionElement = document.createElement('option');
        optionTag.selected = true;
        optionTag.setAttribute('value', 'noUser')
        optionTag.textContent = "No User";
        dropdown!.firstChild!.appendChild(optionTag);
    }
    addAssetDropDownForUsers.appendChild(dropdown);
}

function addRow(): void {
    const tableBody: HTMLElement = document.getElementById('addAssetConfigTableBody')!;
    let newRow: HTMLElement = document.createElement('tr');

    const idCell: HTMLTableCellElement = document.createElement('td');
    idCell.innerHTML = "<input type='text' class='addAssetConfigDetails' required>"

    const nameCell: HTMLTableCellElement = document.createElement('td');
    nameCell.innerHTML = "<input type='text' class='addAssetConfigDetails' required>"
    newRow = appendChildToParent(newRow, idCell, nameCell);

    tableBody.appendChild(newRow);
}

async function addAsset(dropdown: HTMLElement): Promise<void> {
    const getConfigDetail = document.getElementsByTagName('input');
    const assetType = document.getElementById('assetType')! as HTMLSelectElement;
    let configObj: Record<string, string> = {};
    for (let i: number = 1; i < getConfigDetail.length; i += 2) {
        configObj[getConfigDetail[i].value] = getConfigDetail[i + 1].value;
    }
    const firstChild = dropdown.firstChild! as HTMLSelectElement
    const assignUser: string | null | undefined = (firstChild.value == "noUser") ? undefined : firstChild.value;
    const addAssetApiBody: Record<string, string | Record<string, string>> = {
        "name": getConfigDetail[0].value,
        "assetType": assetType.value,
        "config": configObj
    }
    if (assignUser) {
        const userId: number | undefined = getIdFromUsername(firstChild.value);
        addAssetApiBody["userId"] = userId!.toString();
    }
    const responseDataArray = await executePostApi(createAssetApi, addAssetApiBody);
    if (responseDataArray[0].status == 201) {
        window.location.reload();
    }
}

function enterAssetDetails(dropdown: HTMLElement): void {
    addAssetAssignDropDown(dropdown);
    const addRowBtn: HTMLElement = document.getElementById('addRowBtn')!;
    addRowBtn.addEventListener('click', addRow)
    const addAssetBtn: HTMLElement = document.getElementById('addAssetBtn')!;
    addAssetBtn!.onclick = () => addAsset(dropdown);
}

async function deleteAsset(id: number): Promise<void> {
    const assetDeleteApi: string = deleteAssetApi + `${id}`;
    const responseDataArray = await executeDeleteApi(assetDeleteApi);
    assets = responseDataArray[1];
    window.location.reload();
}

function addAssignUnassignButtons(asset: IAsset): HTMLElement {
    let div: HTMLElement = createButtons(<HTMLElement>document.createElement('div'), "", "modal-footer");
    const assignBtn: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "assetAssignBtn", "btn btn-primary");
    assignBtn.textContent = 'Assign';
    const editBtn: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "assetEditBtn", "btn btn-primary");
    editBtn.textContent = 'Edit';
    const saveBtn: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "assetEditBtn", "btn btn-primary");
    saveBtn.textContent = 'Save';
    const unassignBtn: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "assetUnassignBtn", "btn btn-danger");
    unassignBtn.textContent = 'Unassign';
    const addRowDiv: HTMLElement = <HTMLElement>document.getElementById('addRowForEdit');
    addRowDiv.innerHTML = "";
    div = appendChildToParent(div, assignBtn, unassignBtn, editBtn);
    asset.username ? assignBtn.style.display = "none" : unassignBtn.style.display = "none";
    editBtn.onclick = () => editAssets(asset, saveBtn, div);
    assignBtn.onclick = () => assetAssignToUser(asset.id.toString());
    unassignBtn.onclick = () => assetUnassign(asset.id.toString());
    return div;
}

function addRowInEditSection(): void {
    const tableBody: HTMLElement = document.getElementById('configTableBody')!;
    let newRow: HTMLElement = document.createElement('tr');

    const idCell: HTMLTableCellElement = document.createElement('td');
    idCell.innerHTML = "<input type='text' class='editAssetConfigDetails' required>"

    const nameCell: HTMLTableCellElement = document.createElement('td');
    nameCell.innerHTML = "<input type='text' class='editAssetConfigDetails' required>"
    newRow = appendChildToParent(newRow, idCell, nameCell);

    tableBody.appendChild(newRow);
}

async function saveAssetDetails(tableBody: HTMLElement): Promise<void> {
    const id: string = document.getElementById('modalAssetId')!.textContent!;
    const name = document.getElementById('editAssetName')! as HTMLInputElement;
    const assetType = document.getElementById('editAssetType')! as HTMLInputElement;
    const editAssetConfigDetails: HTMLCollectionOf<HTMLInputElement> = tableBody.getElementsByTagName('input');
    const assignedAssetOrNot: HTMLElement = document.getElementById('modalAssetOwner')!;
    let configObj: Record<string, string> = {};
    for (let i: number = 0; i < editAssetConfigDetails.length; i += 2) {
        if (editAssetConfigDetails[i].value.trim().length && editAssetConfigDetails[i + 1].value.trim().length) {
            configObj[editAssetConfigDetails[i].value] = editAssetConfigDetails[i + 1].value;
        }
    }
    let editAssetApiBody: Record<string, string | Record<string, string>> = {
        "name": name.value,
        "assetType": assetType.value,
        "config": configObj
    };
    if (assignedAssetOrNot.textContent != 'Unassigned') {
        const userId: number | undefined = getIdFromUsername(assignedAssetOrNot.textContent!);
        editAssetApiBody["userId"] = userId!.toString();
    }
    const updateApi: string = updateAssetApi + `${id}`;
    const responseDataArray = await executePutApi(updateApi, editAssetApiBody);
    if (responseDataArray[0].status == 200) {
        window.location.reload();
    }
}

function convertTdCellToInput(tableBody: HTMLElement): void {
    const tableDataCells: HTMLCollectionOf<Element> = tableBody.getElementsByTagName('td');
    for (let i: number = 0; i < tableDataCells.length; i++) {
        const value: string = tableDataCells[i].textContent!;
        tableDataCells[i].innerHTML = `<input type='text' class='editAssetConfigDetails' value="${value}">`;
    }
}

function editAssets(asset: IAsset, saveBtn: HTMLElement, div: HTMLElement): void {
    const userDropdown: HTMLElement = document.getElementById('dropDownForUsers')!;
    const addRowDiv: HTMLElement = <HTMLElement>document.getElementById('addRowForEdit');
    const addRowBtnInEditSection: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "addRowInEditSection", "btn btn-primary");
    const assetName: HTMLElement = document.getElementById('modalAssetName')!;
    const assetType: HTMLElement = document.getElementById('modalAssetType')!;
    const tableBody: HTMLElement = document.getElementById('configTableBody')!;
    userDropdown.innerHTML = "";
    div.innerHTML = "";
    div.appendChild(saveBtn);
    saveBtn.onclick = () => saveAssetDetails(tableBody);
    addRowBtnInEditSection.innerHTML = "+";
    addRowBtnInEditSection.onclick = () => addRowInEditSection();
    addRowDiv.appendChild(addRowBtnInEditSection);
    assetName.innerHTML = `<input type="text" value=${asset.name} id="editAssetName" required>`;
    assetType.innerHTML = `<select id="editAssetType">
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                </select>`;
    convertTdCellToInput(tableBody);
}

function getIdFromUsername(username: string): number | undefined {
    for (let i: number = 0; i < users.length; i++) {
        if (users[i].username == username) {
            return users[i].id;
        }
    }
    return undefined;
}

async function assetAssignToUser(id: string): Promise<void> {
    const user: string | null = (<HTMLSelectElement>document.getElementById('users')).value;
    const userId: number | undefined = getIdFromUsername(user!!);
    const apiBody: object = {
        "assetId": id,
        "userId": userId
    }
    const responseDataArray = await executePostApi(assetAssignApi, apiBody);
    if (responseDataArray[0].status == 201) {
        window.location.reload();
    }
}

async function openAsset(asset: IAsset): Promise<void> {
    const assignUnassignCloseBtnBody: HTMLElement = document.getElementById("assignUnassignCloseBtnBody")!;
    const modalAssetId: HTMLElement = document.getElementById("modalAssetId")!;
    const modalAssetName: HTMLElement = document.getElementById("modalAssetName")!;
    const modalAssetType: HTMLElement = document.getElementById("modalAssetType")!;
    const modalAssetOwner: HTMLElement = document.getElementById("modalAssetOwner")!;
    const tableBody: HTMLElement = document.getElementById('configTableBody')!;
    const dropdownForUsers: HTMLElement = document.getElementById('dropDownForUsers')!;
    const closeBtn: HTMLElement = createButtons(<HTMLElement>document.createElement('button'), "close", "btn btn-secondary");
    closeBtn.setAttribute('data-dismiss', 'modal');
    closeBtn.textContent = 'Close';
    dropdownForUsers.innerHTML = "";
    modalAssetId.textContent = asset.id.toString();
    modalAssetName.textContent = asset.name;
    modalAssetType.textContent = asset.assetType;
    modalAssetOwner.textContent = asset.username || 'Unassigned';
    tableBody.innerHTML = "";
    for (let key in asset.config) {
        let row: HTMLElement = document.createElement('tr');

        const objectKeyCell: HTMLElement = document.createElement('td');
        objectKeyCell.textContent = key;

        const objectValueCell: HTMLElement = document.createElement('td');
        objectValueCell.textContent = asset.config[key];
        row = appendChildToParent(row, objectKeyCell, objectValueCell);
        tableBody.appendChild(row);
    }
    assignUnassignCloseBtnBody.innerHTML = "";
    let divElementForButtons: HTMLElement = document.createElement('div');
    const isAdmin: boolean = await checkAdminOrNot();
    if (isAdmin) {
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
    const divForClose: HTMLElement = createButtons(<HTMLElement>document.createElement('div'), "", "modal-footer");
    divForClose.appendChild(closeBtn);
    divElementForButtons.appendChild(divForClose)
    assignUnassignCloseBtnBody.appendChild(divElementForButtons);
}

async function assetUnassign(id: string): Promise<void> {
    const unassignAssetApi: string = assetUnassignApi + `${id}`;
    await executePostApi(unassignAssetApi, {});
    window.location.reload();
}

async function requestAsset(assetId: number): Promise<void> {
    const apiHeaders: object = {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem('token')}`
    }
    const responseDataArray = await executePostApi(assetRequestApi, {assetId}, apiHeaders);

    if (!responseDataArray[0].ok) {
        alert(responseDataArray[1].message);
        return;
    }
    alert("Asset request created successfully");
    window.location.reload();
}

logout(logoutButton);