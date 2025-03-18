import {IBodyStructureForUserAPI} from "../functions/interface.ts";
import {signupApi} from "../functions/api.ts";
import {executePostApi} from "./apiExecution.ts";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
if (localStorage.getItem("token")) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IBodyStructureForUserAPI):Promise<void>{
    const responseDataArray  = await executePostApi(api,body,commonHeaders);
    const data : {OTPtoken:string,message:string} = responseDataArray[1];
    localStorage.setItem("OTPtoken",data.OTPtoken)
    if(!(responseDataArray[0].status >= 200 && responseDataArray[0].status < 300)){
        alert(data.message);
        return;
    }
    window.location.href = "../html/verify.html";
}
const registrationForm: HTMLFormElement = <HTMLFormElement>document.getElementById("registrationForm");
console.log(registrationForm)
registrationForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    const formData:FormData = new FormData(registrationForm);
    const formValues: { [k:string | number] : FormDataEntryValue } = Object.fromEntries(formData);
    if((formValues.phoneNumber).toString().length != 10 || parseInt(<string>formValues.phoneNumber)<0){
        alert("Please enter a valid phone number");
        location.reload();
    }
    const body:IBodyStructureForUserAPI = {
        username : formValues.username,
        firstName : formValues.firstName,
        lastName : formValues.lastName,
        email : formValues.email,
        password : formValues.password,
        phoneNumber : parseInt(<string>formValues.phoneNumber),
        dateOfBirth : formValues.dateOfBirth,
    }
    await postRequest(signupApi,body);
})

