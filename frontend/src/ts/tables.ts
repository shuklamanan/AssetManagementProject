import {IAssetHistory, IAssetRequest, IUser} from "../functions/interface.ts";

function createButtons(htmlNode: HTMLButtonElement, idName: string, className: string,textContent:string): HTMLButtonElement {
    htmlNode.type = 'button';
    htmlNode.textContent = textContent;
    htmlNode.setAttribute('id', idName);
    htmlNode.setAttribute('class', className);
    return htmlNode;
}

function isKeyValidOrNot(key:string):boolean{
    return key!='id' && key!='createdAt' && key!='joiningDate' && key!='userId' && key!='assetId';
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

export function createTable(tableHead:HTMLElement,parentNode:HTMLElement,data: (IUser[] | IAssetHistory[] | IAssetRequest[]),buttonFunctions:Function[],buttonAppear:boolean = false,buttonText:string[] = [],buttonClasses:string[]=[]):void{
    parentNode.innerHTML = "";
    if(!data.length){ return; }
    generateTableHeader(tableHead,data,buttonAppear,buttonText);
    data.forEach((item):void => {
        const row : HTMLTableRowElement = document.createElement("tr");
        Object.entries(item).forEach(([key,value]:[string,any]) => {
            if(isKeyValidOrNot(key)) {
                const cell: HTMLTableCellElement = document.createElement('td');
                if(key=='dateOfBirth' || key=='assignedAt' || key=='unassignedAt'){
                    cell.textContent = value ? new Date(value).toLocaleString() : 'N/A';
                }else {
                    console.log(key,value);
                    cell.textContent = value ?? 'N/A';
                }
                row.appendChild(cell);
            }
        })
        if(buttonAppear){
            for(let i:number=0;i<buttonFunctions.length; i++){
                const deleteButtonCell : HTMLTableCellElement = document.createElement('td');
                const deleteButton: HTMLButtonElement = createButtons(document.createElement('button'),"",buttonClasses[i],buttonText[i]);
                deleteButton.onclick = () => buttonFunctions[i](item);
                deleteButtonCell.appendChild(deleteButton);
                row.appendChild(deleteButtonCell);
            }
        }
        parentNode.appendChild(row);
    })
}