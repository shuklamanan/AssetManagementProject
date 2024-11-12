import nodemailer from "nodemailer";
import ejs from 'ejs'
import dotenv from 'dotenv'
import {IAsset} from "../interfaces";

dotenv.config()
export default async function sendMailForAssetRequests(status:string,email:string,sub:string,asset:IAsset) {
    const transporter = nodemailer.createTransport({
        host: 'mailhog',
        port: 1025
    });
    console.log("mailhogg....");
    ejs.renderFile(__dirname + "/requestOfAsset.ejs", {data: asset.rows[0],status:status}, function (err, data) {
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



