import {assetRequestApi, assetUpdateStatusApi} from "../functions/api.ts";
import {IAssetRequest, IAssetRequestStatusUpdate} from "../functions/interface.ts";
import {executeGetApi, executePostApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";
import {isTokenAvailableOrNot, logout} from "../functions/helperFunctions.ts";

isTokenAvailableOrNot()
const logoutElement:HTMLElement = document.getElementById("logout")!;
async function requestAccept(asset:IAssetRequest):Promise<void>{
    const apiBody:IAssetRequestStatusUpdate = {
        "id":asset.id,
        "status":"Approved"
    }
    console.log(apiBody,asset);
    const responseDataArray  = await executePostApi(assetUpdateStatusApi,apiBody);
    const res = responseDataArray[1];
    if(!(responseDataArray[0].status>=200 && responseDataArray[0].status < 300)){
        alert(res.message);
    }
    window.location.reload()
}
async function requestReject(asset:IAssetRequest):Promise<void>{
    const apiBody:IAssetRequestStatusUpdate = {
        "id":asset.id,
        "status":"Disapproved"
    }
    const responseDataArray  = await executePostApi(assetUpdateStatusApi,apiBody);
    const res = responseDataArray[1];
    if(!(responseDataArray[0].status>=200 && responseDataArray[0].status < 300)){
        alert(res.message);
    }
    window.location.reload()
}

async function fetchAssetsRequests(): Promise<void> {
    const responseDataArray  = await executeGetApi(assetRequestApi);
    pendingRequests = responseDataArray[1];
    console.log(responseDataArray)
    console.log(pendingRequests);
    await displayAssetsRequests(pendingRequests);
}

let pendingRequests: IAssetRequest[] = [];
await fetchAssetsRequests();

async function displayAssetsRequests(pendingRequests: IAssetRequest[]): Promise<void> {
    let tbody: HTMLElement = document.getElementById('assetRequestTableBody')!;
    const tableHead:HTMLElement = document.getElementById('table-head')!;
    createTable(tableHead,tbody,pendingRequests,[requestAccept,requestReject],true,["Accept","Reject"],["btn btn-primary","btn btn-danger"],[])
}

logout(logoutElement);