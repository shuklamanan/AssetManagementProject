import {verifyUserViaOtpApi} from "../functions/api.ts";
import {executePostPutDeleteApi} from "./apiExecution.ts";

if(!localStorage.getItem("OTPtoken")){
    location.href='../html/register.html'
}
async function postRequest(api:string,body: { otp:number }):Promise<void>{
    const apiHeaders:object={
        'Authorization': `${localStorage.getItem('OTPtoken')}`,
        'Content-Type': 'application/json'
    }
    const responseAnswerArray  = await executePostPutDeleteApi(api,"POST",body,apiHeaders);
    if(responseAnswerArray[0].status>=200 && responseAnswerArray[0].status < 300){
        alert("user created successfully")
        window.location.href = "/src/html/login.html";
    }
    else{
        alert((responseAnswerArray[1]).message);
        window.location.reload()
    }
}
const registrationForm: HTMLFormElement = <HTMLFormElement>document.getElementById("registrationForm");
registrationForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    let otp:number = Number(document.getElementById("otp")!.value)
    await postRequest(verifyUserViaOtpApi, {otp:otp});
})

