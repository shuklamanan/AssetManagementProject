import redisClient from "../redisConfig.ts";

const storeOTP = async (key: string, otp: number): Promise<void> => {
    await redisClient.setEx(key, 300, otp.toString());
};

const getOTP = async (key: string): Promise<string | null> => {
    return await redisClient.get(key);
};

const deleteOTP = async (key: string): Promise<void> => {
    await redisClient.del(key);
};

async function main(){
    await storeOTP("utsav",1234)
    console.log(await getOTP("utsav"))
    await deleteOTP("utsav")
    console.log(await getOTP("utsav"))
}
main()