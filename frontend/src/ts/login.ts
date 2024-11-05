interface bodyStructure{
    username : string,
    password : string,
}

const commonApi = `http://localhost:5001/`;
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
console.log(localStorage.getItem("token"));
if (localStorage.getItem("token")!=null) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:bodyStructure): Promise<void>{
    const res : Response = await fetch(api, {
        method:"POST",
        headers:commonHeaders,
        body:JSON.stringify(body)
    });

    const data = await res.json();
    if(!(res.status >= 200 && res.status < 300)){
        alert(data.message)
        return;
    }
    console.log(data);
    if(data.token){
        localStorage.setItem('token', data.token);
        window.location.href = "/src/html/index.html";
    }
}
console.log("**********");
document.querySelector('#login')?.addEventListener("click", async (e : Event) :Promise<void> => {
    e.preventDefault();
    console.log("*********");
    const username : string = (<HTMLInputElement>document.getElementById('username'))!.value;
    const password :string = (<HTMLInputElement>document.getElementById('password'))!.value;

    // (<HTMLInputElement>document.getElementById('email')).value = "";
    // (<HTMLInputElement>document.getElementById('password')).value = "";

    console.log(username, password);
    const registerApi : string = commonApi + "users/login";
    const body = {
        username : username,
        password : password
    }
    await postRequest(registerApi,body);
})