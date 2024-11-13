import nodemailer from "nodemailer";
import ejs from 'ejs';
import dotenv from 'dotenv';

dotenv.config();

export default async function mailUser(
    email: string,
    subject: string,
    username: string,
    firstName: string,
    lastName: string,
    userEmail: string,
    phoneNumber: number,
    dateOfBirth: Date | string,
    title: string
) {
    const transporter = nodemailer.createTransport({
        // host: 'localhost',
        host:'mailhog',
        port: 1025
    });

    ejs.renderFile(__dirname + "/mailUser.ejs",
        {
            user: {
                username,
                first_name: firstName,
                last_name: lastName,
                email: userEmail,
                phone_number: phoneNumber,
                date_of_birth: dateOfBirth
            },
            title
        },
        function (err, data) {
            if (err) {
                console.log(err);
            } else {
                const mailOptions = {
                    from: 'user-management-bot@noovosoft.com',
                    to: email,
                    subject: subject,
                    html: data
                };
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
        }
    );
}
