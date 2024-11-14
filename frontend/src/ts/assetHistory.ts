import fetchUserRoles from '../functions/fetchUserRoles.ts'
import {IAssetHistory} from "../functions/interface.ts";
import {assetHistoryApi} from "../functions/api.ts";
import {executeGetApi} from "./apiExecution.ts";
import {createTable} from "./tables.ts";
import {emptyFunction} from "../functions/emptyFunctions.ts";

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
    const responseDataArray  = await executeGetApi(assetHistoryApi);
    let assets:IAssetHistory[] = responseDataArray[1];
    console.log(assets)
    displayAssetHistory(assets);
}

function displayAssetHistory(assetHistory: IAssetHistory[]): void {
    let tbody : HTMLElement = <HTMLElement>document.getElementById('asset-history');
    const tableHead:HTMLElement = document.getElementById('table-head')!;
    tbody.innerHTML = '';
    createTable(tableHead,tbody,assetHistory,[emptyFunction]);
}
await fetchAssetHistory()

