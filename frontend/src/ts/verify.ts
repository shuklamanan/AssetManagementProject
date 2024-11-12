import {verifyUserViaOtpApi} from "../functions/api.ts";

if(!localStorage.getItem("OTPtoken")){
    location.href='../html/register.html'
}
async function postRequest(api:string,body: { otp:number }):Promise<void>{

    const response : Response = await fetch(api,{
        headers:{
        'Authorization': `${localStorage.getItem('OTPtoken')}`,
        'Content-Type': 'application/json'
        },
        body:JSON.stringify(body),
        method:"POST"
    })
    if(response.status>=200 && response.status < 300){
        alert("user created successfully")
        window.location.href = "/src/html/login.html";
    }
    else{
        alert((await response.json()).message);
        window.location.reload()
    }
}
const registrationForm: HTMLFormElement = <HTMLFormElement>document.getElementById("registrationForm");
registrationForm.addEventListener("submit", async(e : Event) :Promise<void> => {
    e.preventDefault();
    let otp = Number(document.getElementById("otp")!.value)
    await postRequest(verifyUserViaOtpApi, {otp:otp});
})

