import {IAssetHistory, IAssetRequest, IUser} from "../functions/interface.ts";
import {createButtons} from "../functions/createButtons.ts";
import {profileDetails} from "../functions/getProfileDeatails.ts";

function isKeyValidOrNot(key:string):boolean{
    return key!='id' && key!='createdAt' && key!='joiningDate' && key!='userId' && key!='assetId';
}

function isKeyDateOrNot(key:string):boolean{
    return key=='dateOfBirth' || key=='assignedAt' || key=='unassignedAt';
}

function convertCamelCaseToPascalCase(columnName:string):string{
    let pascalCase:string = columnName[0].toUpperCase();
    for(let i:number=1;i<columnName.length;i++){
        if(columnName[i]>='A' && columnName[i]<='Z'){
            pascalCase+=' ';
            pascalCase+=columnName[i].toLowerCase();
        }
        else{
            pascalCase+=columnName[i].toLowerCase();
        }
    }
    return pascalCase;
}

function generateTableHeader(tableHead:HTMLElement,data:(IUser[] | IAssetHistory[] | IAssetRequest[]),buttonAppear:boolean=false,buttonText:string[]=[]){
    const tableRow:HTMLTableRowElement = document.createElement("tr");
    Object.entries((data[0])).forEach(([key, value]:[string,any]) => {
        if(isKeyValidOrNot(key)){
            const th:HTMLTableCellElement = document.createElement("th");
            th.setAttribute('scope','col');
            th.textContent = convertCamelCaseToPascalCase(key);
            tableRow.appendChild(th);
        }
    })
    if(buttonAppear){
        for(let i:number=0;i<buttonText.length;i++) {
            const th: HTMLTableCellElement = document.createElement("th");
            th.setAttribute('scope', 'col');
            th.textContent = buttonText[i];
            tableRow.appendChild(th);
        }
    }
    tableHead.appendChild(tableRow);
}

function storeDisableForAdminButtons(disableForAdmin : string[]):Map<string,number>{
    let map:Map<string,number> = new Map();
    if(!disableForAdmin.length){
        return map;
    }
    (disableForAdmin).forEach((element:string) => map.set(element,1));
    return map;
}

export function createTable(tableHead:HTMLElement,parentNode:HTMLElement,data: (IUser[] | IAssetHistory[] | IAssetRequest[]),buttonFunctions:Function[],buttonAppear:boolean = false,buttonText:string[] = [],buttonClasses:string[]=[],disableForAdmin:string[]):void{
    parentNode.innerHTML = "";
    if(!data.length){
        parentNode.textContent = "No data Available";
        return;
    }
    const storedButtons:Map<string,number> = storeDisableForAdminButtons(disableForAdmin);
    generateTableHeader(tableHead,data,buttonAppear,buttonText);
    data.forEach((item:IUser | IAssetHistory | IAssetRequest):void => {
        const row : HTMLTableRowElement = document.createElement("tr");
        Object.entries(item).forEach(([key,value]:[string,any]) => {
            if(isKeyValidOrNot(key)) {
                const cell: HTMLTableCellElement = document.createElement('td');
                if(isKeyDateOrNot(key)){
                    cell.textContent = value ? new Date(value).toLocaleString() : 'N/A';
                }else {
                    console.log(key,value);
                    cell.textContent = value ?? 'N/A';
                }
                row.appendChild(cell);
            }
        })
        console.log(profileDetails.username, item.username);
        if(buttonAppear){
            for(let i:number=0;i<buttonFunctions.length; i++){
                const buttonCell: HTMLTableCellElement = document.createElement('td');
                if(disableForAdmin.length){
                    if(storedButtons.get(buttonText[i]) && item.username !== profileDetails.username) {
                        const button: HTMLButtonElement = createButtons(document.createElement('button'), "", buttonClasses[i], buttonText[i]);
                        button.onclick = () => buttonFunctions[i](item);
                        buttonCell.appendChild(button);
                    }
                }
                else{
                    const button: HTMLButtonElement = createButtons(document.createElement('button'), "", buttonClasses[i], buttonText[i]);
                    button.onclick = () => buttonFunctions[i](item);
                    buttonCell.appendChild(button);
                }
                row.appendChild(buttonCell);
            }
        }
        parentNode.appendChild(row);
    })
}