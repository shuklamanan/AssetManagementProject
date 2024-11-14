import {IForgetPassword, IForgetPasswordToken} from "../functions/interface.ts";
import {forgetPasswordApi} from "../functions/api.ts";
import {executePostPutDeleteApi} from "./apiExecution.ts";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
if (localStorage.getItem("token")!=null) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IForgetPassword): Promise<void>{
    console.log(body);
    const responseDataArray  = await executePostPutDeleteApi(api,"POST",body,commonHeaders);

    const data: IForgetPasswordToken = responseDataArray[1];
    if(!(responseDataArray[0].status >= 200 && responseDataArray[0].status < 300)){
        alert(data.message)
        return;
    }
    if(data.forgetPasswordToken){
        localStorage.setItem('resetPasswordToken', data.forgetPasswordToken);
        window.location.href = "/src/html/resetPassword.html";
    }
}
const forgetPasswordForm : HTMLFormElement = <HTMLFormElement>document.getElementById('forgetPasswordForm');
forgetPasswordForm.addEventListener("submit", async (e: Event): Promise<void> => {
    e.preventDefault();
    console.log("hioii");
    const formData: FormData = new FormData(forgetPasswordForm);
    const formValues : object = Object.fromEntries(formData);
    const body : IForgetPassword = {
        username:formValues.username,
    };
    await postRequest(forgetPasswordApi, body);
});






