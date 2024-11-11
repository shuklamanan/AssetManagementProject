import fetchUserRoles from '../functions/fetchUserRoles.ts';
import {getProfileApi, headers} from "../functions/api.ts";
if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

async function displayContentBasedOnRoles(roles: string[]): Promise<void> {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none";
        document.getElementById("asset-history-nav")!.style.display = "none";
        document.getElementById("asset-request-nav")!.style.display = "none";
    }
}

const roles: string[] = await fetchUserRoles();
await displayContentBasedOnRoles(roles);

async function fetchUserProfile() : Promise<void> {
    const response : Response = await fetch(getProfileApi, {
        headers: headers,
    });
    const userData = await response.json();
    console.log(userData);
    (<HTMLElement>document.getElementById('username')).textContent = userData.username || "N/A";
    (<HTMLElement>document.getElementById('fullName')).textContent = userData.firstName + " " + userData.lastName || "N/A";
    (<HTMLElement>document.getElementById('email')).textContent = userData.email || "N/A";
    // (document.getElementById('department') as HTMLElement).textContent = userData.department || "N/A";
    (<HTMLElement>document.getElementById('phoneNumber')).textContent = userData.phoneNumber || "N/A";
    (<HTMLElement>document.getElementById('dob')).textContent = userData.dateOfBirth.substring(0,10) || "N/A";
    (<HTMLElement>document.getElementById('joiningDate')).textContent = userData.joiningDate.substring(0,10) || "N/A";
}

document.getElementById("logout")!.addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})
await fetchUserProfile();