export  function generateOTP(size:number):number{
    let str = ''
    for(let i = 0;i<size;i++){
        str+=Math.floor(Math.random()*10)
    }
    return Number(str)
}