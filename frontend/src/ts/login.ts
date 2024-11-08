import { IBodyStructureForAPI } from "../functions/interface";

const commonApi : string = `http://localhost:5001/`;
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
if (localStorage.getItem("token")!=null) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IBodyStructureForAPI): Promise<void>{
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
    if(data.token){
        localStorage.setItem('token', data.token);
        window.location.href = "/src/html/index.html";
    }
}
const loginForm : HTMLFormElement = <HTMLFormElement>document.getElementById('loginForm');
loginForm.addEventListener("submit", async (e: Event): Promise<void> => {
    e.preventDefault();
    const formData: FormData = new FormData(loginForm);
    const formValues : Object = Object.fromEntries(formData);
    const loginApi: string = commonApi + "users/login";
    const body : IBodyStructureForAPI = {
        username:formValues.username,
        password:formValues.password
    };
    await postRequest(loginApi, body);
});