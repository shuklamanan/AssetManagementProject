import {verifyUserViaOtpApi} from "../functions/api.ts";
import {executePostApi} from "./apiExecution.ts";

if(!localStorage.getItem("OTPtoken")){
    location.href='../html/register.html'
}

async function postRequest(api:string,body: { otp:number }):Promise<void>{
    const apiHeaders:object={
        'Authorization': `${localStorage.getItem('OTPtoken')}`,
        'Content-Type': 'application/json'
    }
    const responseDataArray  = await executePostApi(api,body,apiHeaders);
    if(responseDataArray[0].status>=200 && responseDataArray[0].status < 300){
        alert("user created successfully")
        window.location.href = "/src/html/login.html";
    }
    else{
        alert((responseDataArray[1]).message);
        window.location.reload()
    }
}

const registrationForm: HTMLFormElement = <HTMLFormElement>document.getElementById("registrationForm");
registrationForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    const getOTP : string | null = (<HTMLInputElement>document.getElementById("otp")).value
    let otp:number = Number(getOTP)
    await postRequest(verifyUserViaOtpApi, {otp:otp});
})

