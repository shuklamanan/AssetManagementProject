import {IForgetPasswordToken, IResetPassword} from "../functions/interface.ts";
import {resetPasswordApi} from "../functions/api.ts";
import {executePostPutDeleteApi} from "./apiExecution.ts";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*",
    "Authorization": localStorage.getItem("resetPasswordToken")!
}
if (localStorage.getItem("token")!=null) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IResetPassword): Promise<void>{
    console.log(body);
    const responseDataArray  = await executePostPutDeleteApi(api,"POST",body,commonHeaders);

    const data: IForgetPasswordToken = responseDataArray[1];
    if(!(responseDataArray[0].status >= 200 && responseDataArray[0].status < 500)){
        alert(data.message)
        return;
    }else{
        window.location.href = "/src/html/login.html";
    }
}
const resetPasswordForm : HTMLFormElement = <HTMLFormElement>document.getElementById('reset-password-form');
resetPasswordForm.addEventListener("submit", async (e: Event): Promise<void> => {
    e.preventDefault();
    console.log("hioii");
    const formData: FormData = new FormData(resetPasswordForm);
    const formValues : object = Object.fromEntries(formData);
    const body : IResetPassword = {
        otp:formValues.otp,
        password:formValues.newPassword,
        confirmPassword:formValues.confirmPassword
    };
    await postRequest(resetPasswordApi, body);
});
