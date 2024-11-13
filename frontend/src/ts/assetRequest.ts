import {assetRequestApi, assetUpdateStatusApi} from "../functions/api.ts";
import {IAssetRequest, IAssetRequestStatusUpdate} from "../functions/interface.ts";
import {executeGetApi, executePostPutDeleteApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

async function requestAccept(asset:IAssetRequest):Promise<void>{
    const apiBody:IAssetRequestStatusUpdate = {
        "id":asset.id,
        "status":"Approved"
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
async function requestReject(asset:IAssetRequest):Promise<void>{
    const apiBody:IAssetRequestStatusUpdate = {
        "id":asset.id,
        "status":"Disapproved"
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
    createTable(tbody,pendingRequests,[requestAccept,requestReject],true,["Accept","Reject"],["btn btn-primary","btn btn-danger"])
}