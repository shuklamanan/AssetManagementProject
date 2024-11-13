import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IAssetHistory} from "../functions/interface.ts";
import {assetHistoryApi, emptyFunction} from "../functions/api.ts";
import {executeGetApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
const roles : string[] = await fetchUserRoles();
if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}

document.getElementById("logout")!.addEventListener('click',() : void=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})

async function fetchAssetHistory(): Promise<void> {
    const responseAnswerArray  = await executeGetApi(assetHistoryApi);
    let assets:IAssetHistory[] = responseAnswerArray[1];
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: IAssetHistory[]): void {
    let tbody : HTMLElement = <HTMLElement>document.getElementById('asset-history');
    tbody.innerHTML = '';
    createTable(tbody,assetHistory,[emptyFunction]);
}
await fetchAssetHistory()

