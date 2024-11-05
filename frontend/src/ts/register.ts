interface IBodyStructure{
    username : string,
    firstName : string,
    lastName : string,
    email : string,
    password : string,
    phoneNo : number,
    dateOfBirth : string,
}

const commonApi = "http://localhost:5001/";
const commonHeaders  : HeadersInit =  {
    "Content-Type": "application/json",
    "Access-Control-Origin": "*"
}
console.log("file called");
if (localStorage.getItem("token")) {
    console.log("hello");
    window.location.href = "/src/html/index.html"
}

async function postRequest(api:string,body:bodyStructure):Promise<void>{
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
    window.location.href = "src/html/login.html";
}

const registerButton : HTMLButtonElement = <HTMLButtonElement>document.getElementById("register");
registerButton?.addEventListener("click", async(e : Event) :Promise<void> => {
    e.preventDefault();
    const username : string = (<HTMLInputElement>document.getElementById('username'))!.value;
    const firstName : string = (<HTMLInputElement>document.getElementById('firstName'))!.value;
    const lastName : string = (<HTMLInputElement>document.getElementById('lastName'))!.value;
    const email : string = (<HTMLInputElement>document.getElementById('email'))!.value;
    const password :string = (<HTMLInputElement>document.getElementById('password'))!.value;
    const phoneNumber :string = (<HTMLInputElement>document.getElementById('phoneNumber'))!.value;
    const dateOfBirth :string = (<HTMLInputElement>document.getElementById('dob')).value;

    (<HTMLInputElement>document.getElementById('username'))!.value = "";
    (<HTMLInputElement>document.getElementById('firstName'))!.value = "";
    (<HTMLInputElement>document.getElementById('lastName'))!.value = "";
    (<HTMLInputElement>document.getElementById('email'))!.value = "";
    (<HTMLInputElement>document.getElementById('password'))!.value = "";
    (<HTMLInputElement>document.getElementById('phoneNumber'))!.value = "";
    (<HTMLInputElement>document.getElementById('dob'))!.value = "";

    console.log(firstName,lastName,email, password);
    if(phoneNumber.length != 10 || parseInt(phoneNumber)<0){
        alert("Please enter a valid phone number");
        location.reload();
    }
    const signupApi : string = commonApi + "users/signup";
    const body = {
        username : username,
        firstName : firstName,
        lastName : lastName,
        email : email,
        password : password,
        phoneNo : parseInt(phoneNumber),
        dateOfBirth : dateOfBirth,
    }
    await postRequest(signupApi,body);
})

