import {IBodyStructureForUserAPI} from "../functions/interface.ts";

const commonApi : string = "http://localhost:5001/";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
if (localStorage.getItem("token")) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IBodyStructureForUserAPI):Promise<void>{
    const res : Response  = await fetch(api, {
        method:"POST",
        headers:commonHeaders,
        body:JSON.stringify(body)
    });
    const data = await res.json();
    if(!(res.status >= 200 && res.status < 300)){
        alert(data.message);
        return;
    }
    window.location.href = "./login.html";
}
const registrationForm: HTMLFormElement = <HTMLFormElement>document.getElementById("registrationForm");
registrationForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    const formData:FormData = new FormData(registrationForm);
    const formValues: Object = Object.fromEntries(formData);
    if(formValues.phoneNumber.length != 10 || parseInt(formValues.phoneNumber)<0){
        alert("Please enter a valid phone number");
        location.reload();
    }
    const signupApi : string = commonApi + "users/signup";
    const body:IBodyStructureForUserAPI = {
        username : formValues.username,
        firstName : formValues.firstName,
        lastName : formValues.lastName,
        email : formValues.email,
        password : formValues.password,
        phoneNumber : parseInt(formValues.phoneNumber),
        dateOfBirth : formValues.dateOfBirth,
    }
    await postRequest(signupApi,body);
})

