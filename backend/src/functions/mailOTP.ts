import nodemailer from "nodemailer";
import ejs from 'ejs'
import dotenv from 'dotenv'

dotenv.config()
export default async function mailOTP(otp:number,email:string,sub:string) {
    const transporter = nodemailer.createTransport({
        host: 'mailhog',
        // host:'localhost',
        port: 1025
    });
    const data = {otp:otp}
    ejs.renderFile(__dirname + "/mailOTP.ejs", {data: data}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'asset-management-bot@noovosoft.com',
                to: email,
                subject: sub,
                html: data
            };
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
        }

    });
}



