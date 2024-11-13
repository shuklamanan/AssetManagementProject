import {IBodyStructureForAPI, ILoginToken} from "../functions/interface.ts";
import {loginApi} from "../functions/api.ts";
import {executePostPutDeleteApi} from "./apiExecution.ts";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
if (localStorage.getItem("token")!=null) {
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:IBodyStructureForAPI): Promise<void>{
    const responseAnswerArray  = await executePostPutDeleteApi(api,"POST",body,commonHeaders);

    const data: ILoginToken = responseAnswerArray[1];
    if(!(responseAnswerArray[0].status >= 200 && responseAnswerArray[0].status < 300)){
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
    const formValues : object = Object.fromEntries(formData);
    const body : IBodyStructureForAPI = {
        username:formValues.username,
        password:formValues.password
    };
    await postRequest(loginApi, body);
});