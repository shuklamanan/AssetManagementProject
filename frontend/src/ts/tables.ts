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

export function createTable(parentNode:HTMLElement,data: (IUser[] | IAssetHistory[] | IAssetRequest[]),buttonFunctions:Function[],buttonAppear:boolean = false,buttonText:string[] = [],buttonClasses:string[]=[]):void{
    parentNode.innerHTML = "";
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
                deleteButton.onclick = () => buttonFunctions[i](item.id);
                deleteButtonCell.appendChild(deleteButton);
                row.appendChild(deleteButtonCell);
            }
        }
        parentNode.appendChild(row);
    })
}