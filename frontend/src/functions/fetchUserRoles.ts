export default async function fetchUserRoles(): Promise<string[]> {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5001/users/roles', {
        method: 'GET',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
    });
    return await response.json();
}
