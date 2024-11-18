export function createButtons(htmlNode: HTMLButtonElement, idName: string, className: string,textContent:string): HTMLButtonElement {
    htmlNode.type = 'button';
    htmlNode.textContent = textContent;
    htmlNode.setAttribute('id', idName);
    htmlNode.setAttribute('class', className);
    return htmlNode;
}