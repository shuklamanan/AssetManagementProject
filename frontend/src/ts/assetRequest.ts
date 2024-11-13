import {assetRequestApi, assetUpdateStatusApi} from "../functions/api.ts";
import {IAssetRequest, IAssetRequestStatusUpdate} from "../functions/interface.ts";
import {executeGetApi, executePostPutDeleteApi} from "./apiExecution.ts";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

function createButtons(htmlNode: HTMLElement, idName: string, className: string): HTMLElement {
    htmlNode.setAttribute('id', idName);
    htmlNode.setAttribute('class', className);
    return htmlNode;
}

function createAcceptAndRejectButtons(className: string, idName: string, buttonContent: string): HTMLElement {
    let buttonCell: HTMLElement = document.createElement('td');
    const button: HTMLElement = createButtons(document.createElement('button'), idName, className);
    (<HTMLButtonElement>button).type = 'button';
    button.textContent = buttonContent;
    buttonCell = appendChildToParent(buttonCell, button);
    return buttonCell;
}

function appendChildToParent(parentNode: HTMLElement, ...childNodes: HTMLElement[]): HTMLElement {
    for (const child of childNodes) {
        parentNode.appendChild(child);
    }
    return parentNode;
}

async function requestAcceptOrReject(asset:IAssetRequest,status:string):Promise<void>{
    const apiBody:IAssetRequestStatusUpdate = {
        "id":asset.id,
        "status":status
    }
    const responseAnswerArray  = await executePostPutDeleteApi(assetUpdateStatusApi,"POST",apiBody);
    const res = responseAnswerArray[1];
    if(responseAnswerArray[0].status>=200 && responseAnswerArray[0].status < 300){
        window.location.reload()
    }
    else{
        alert(res.message);
    }
}

async function fetchAssetsRequests(): Promise<void> {
    const responseAnswerArray  = await executeGetApi(assetRequestApi);
    pendingRequests = responseAnswerArray[1];
    console.log(pendingRequests);
    await displayAssetsRequests(pendingRequests);
}
let pendingRequests: IAssetRequest[] = [];
await fetchAssetsRequests();

async function displayAssetsRequests(pendingRequests: IAssetRequest[]): Promise<void> {
    let tbody: HTMLElement = document.getElementById('assetRequestTableBody')!;
    pendingRequests.forEach(asset => {
        let row: HTMLElement = document.createElement('tr');

        const idCell: HTMLElement = document.createElement('td');
        idCell.textContent = asset.id.toString();

        const nameCell: HTMLElement = document.createElement('td');
        nameCell.textContent = asset.assetName;

        const usernameCell: HTMLElement = document.createElement('td');
        usernameCell.textContent = asset.username;

        const acceptButtonCell: HTMLElement = createAcceptAndRejectButtons('btn btn-primary',"accept-request","Accept");
        acceptButtonCell.onclick = () => requestAcceptOrReject(asset,"Approved");

        const rejectButtonCell: HTMLElement = createAcceptAndRejectButtons('btn btn-danger',"reject-request","Reject");
        rejectButtonCell.onclick = () => requestAcceptOrReject(asset,"Disapproved");

        row = appendChildToParent(row, idCell, nameCell, usernameCell,acceptButtonCell,rejectButtonCell);
        tbody = appendChildToParent(tbody, row);
    });
}