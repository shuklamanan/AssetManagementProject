import fetchUserRoles from '../functions/fetchUserRoles.ts'
if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}
function displayContentBasedOnRoles(roles: string[]): void {
    if(!roles.includes('Admin')){
        document.getElementById("user-nav").style.display = "none"
    }
}

const roles = await fetchUserRoles();
displayContentBasedOnRoles(roles);


if(!roles.includes("Admin")){
    location.href = '/src/html/index.html'
}
