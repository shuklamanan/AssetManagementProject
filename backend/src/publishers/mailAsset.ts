import amqp from "amqplib";
import dotenv from "dotenv"
dotenv.config()

export async function publishAssetNotification(notificationData: object) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        const channel = await connection.createChannel();
        const queue = 'asset_notification_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(notificationData)), {
            persistent: true,
        });

        console.log('asset notification sent to queue');
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error publishing to user notification queue:', error);
    }
}

