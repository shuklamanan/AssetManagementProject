import bcrypt from "bcrypt";

export async function hashPassword(password: string =""): Promise<string> {
    const saltRounds : number = 10;
    return await new Promise((resolve, reject) : void => {
        bcrypt.hash(password, saltRounds, function (err :Error | undefined, hash : string) {
            if (err) reject(err)
            resolve(hash)
        });
    })
}