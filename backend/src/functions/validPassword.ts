export function isValidPassword(password: string) : boolean {
    const regex : RegExp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,20}$/;
    return regex.test(password);
}