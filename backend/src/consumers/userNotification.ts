// @ts-ignore
import amqp from 'amqplib';
import mailUser from "../functions/mailUser";

async function consumeUserNotifications() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL!!);
        const channel = await connection.createChannel();
        const queue = 'user_notification_queue';

        await channel.assertQueue(queue, { durable: true });
        console.log(`Listening to ${queue}...`);

        await channel.consume(queue, async (message) => {
            if (message) {
                const notificationData = JSON.parse(message.content.toString());
                await mailUser(
                    notificationData.email,
                    notificationData.subject,
                    notificationData.username,
                    notificationData.firstName,
                    notificationData.lastName,
                    notificationData.userEmail,
                    notificationData.phoneNumber,
                    notificationData.dateOfBirth,
                    notificationData.title
                );

                channel.ack(message);
            }
        });
    } catch (error) {
        console.error('Error consuming user notifications:', error);
    }
}

consumeUserNotifications();
