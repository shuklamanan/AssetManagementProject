import nodemailer from "nodemailer";
import client from '../../postgresConfig'
import ejs from 'ejs'
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import dotenv from 'dotenv'

dotenv.config()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default async function sendmail(username, email, sub, limit, offset, desc, isAdmin, startDate, endDate) {
    const transporter = nodemailer.createTransport({
        host: 'mailhog',
        // host:'localhost',
        port: 1025
    });
    let query
    let data
    if (isAdmin) {
        query = `select * from ((select * from transactions) union (select * from pending_transactions)) as t where t.created_at between $1 and $2 order by t.created_at ${desc ? "desc" : ""} limit $3 offset $4  `
        console.log(query)
        data = (await client.query(query, [startDate ?? process.env.DEFAULT_START_DATE, endDate ?? 'now()', limit, offset])).rows
    } else {
        query = `select * from  ((select * from transactions) union (select * from pending_transactions)) as t where (t.from_usr = $1 or t.to_usr = $1) and (t.created_at between $2 and $3) order by t.created_at ${desc ? "desc" : ""}  limit $4 offset $5`
        console.log(query)
        data = (await client.query(query, [username, startDate ?? process.env.DEFAULT_START_DATE, endDate ?? 'now()', limit, offset])).rows
    }

    ejs.renderFile(__dirname + "/mailTemplate.ejs", {data: data}, function (err, data) {
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



