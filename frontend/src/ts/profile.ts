import fetchUserRoles from '../functions/fetchUserRoles.ts';

if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined) {
    window.location.href = "/src/html/login.html";
}

async function displayContentBasedOnRoles(roles: string[]): Promise<void> {
    if (!roles.includes('Admin')) {
        document.getElementById("user-nav").style.display = "none";
    }
}

const roles = await fetchUserRoles();
displayContentBasedOnRoles(roles);

async function fetchUserProfile() {
    const response = await fetch('http://localhost:5001/profile', {
        headers: {
            'Authorization': `${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    const userData = await response.json();

    (document.getElementById('username') as HTMLElement).textContent = userData.username || "N/A";
    (document.getElementById('firstName') as HTMLElement).textContent = userData.first_name || "N/A";
    (document.getElementById('lastName') as HTMLElement).textContent = userData.last_name || "N/A";
    (document.getElementById('email') as HTMLElement).textContent = userData.email || "N/A";
    (document.getElementById('department') as HTMLElement).textContent = userData.department || "N/A";
    (document.getElementById('phoneNumber') as HTMLElement).textContent = userData.phone_number || "N/A";
    (document.getElementById('dob') as HTMLElement).textContent = userData.date_of_birth || "N/A";
}


fetchUserProfile();
