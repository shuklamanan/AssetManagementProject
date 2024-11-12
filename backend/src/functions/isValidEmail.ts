export  function isValidEmail(email:string,domain:string):Boolean{
    // Email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return false;
    }
    //i flag is for case insensative
    const domainPattern = new RegExp(`@${domain}\\.(com|in|org|net)$`, 'i');
    return domainPattern.test(email);
}