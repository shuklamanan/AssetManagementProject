import fetchUserRoles from '../functions/fetchUserRoles.ts';
if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

async function displayContentBasedOnRoles(roles: string[]): Promise<void> {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav")!.style.display = "none";
    }
}

const roles = await fetchUserRoles();
displayContentBasedOnRoles(roles);

async function fetchUserProfile() : Promise<void> {
    const response : Response = await fetch('http://localhost:5001/users/profile', {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    const userData = await response.json();

    (document.getElementById('username') as HTMLElement).textContent = userData.username || "N/A";
    (document.getElementById('fullName') as HTMLElement).textContent = userData.first_name + " " + userData.last_name || "N/A";
    (document.getElementById('email') as HTMLElement).textContent = userData.email || "N/A";
    // (document.getElementById('department') as HTMLElement).textContent = userData.department || "N/A";
    (document.getElementById('phoneNumber') as HTMLElement).textContent = userData.phone_number || "N/A";
    (document.getElementById('dob') as HTMLElement).textContent = userData.date_of_birth.substring(0,10) || "N/A";
    (document.getElementById('joiningDate') as HTMLElement).textContent = userData.joining_date.substring(0,10) || "N/A";
}

document.getElementById("logout").addEventListener('click',()=>{
    localStorage.clear();
    location.href = "/src/html/login.html"
})
fetchUserProfile();
