import nodemailer from "nodemailer";
import ejs from 'ejs'
import dotenv from 'dotenv'
import {IAsset, IAssetAndUserDetails} from "../interfaces";

dotenv.config()
export default async function sendMailForAssetUnassignment(email:string,sub:string,assetName:string,assetType:string) {
    const transporter = nodemailer.createTransport({
        host: 'mailhog',
        port: 1025
    });
    const asset : Record<string,string> ={
        name : assetName,
        type : assetType
    }
    console.log("mailhogg....",asset);
    ejs.renderFile(__dirname + "/assetUnassign.ejs", {data: asset}, function (err, data) {
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



