export function emptyFunction():void{}

export function isTokenAvailableOrNot(){
    if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
        window.location.href = "/src/html/login.html";
    }
}

export function displayContentBasedOnRoles(roles: string[]): void {
    console.log(roles)
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none"
        document.getElementById("asset-history-nav")!.style.display = "none"
        document.getElementById("asset-request-nav")!.style.display = "none";
    }
}

export function logout(logoutElement : HTMLElement){
    logoutElement.addEventListener("click", ()=>{
        localStorage.clear();
        window.location.reload();
    })
}