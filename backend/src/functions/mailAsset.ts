import nodemailer from "nodemailer";
import ejs from 'ejs'
import dotenv from 'dotenv'

dotenv.config()
export default async function mailAsset(email:string, sub:string, config:object|string|undefined, name:string, asset_type:string, title:string) {
    const transporter = nodemailer.createTransport({
        host: 'mailhog',
        // host: 'localhost',
        port: 1025
    });

    ejs.renderFile(__dirname + "/mailAsset.ejs", {data: {config, name, asset_type, title}}, function (err, data) {
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



