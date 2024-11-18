import amqp from 'amqplib';
import mailAsset from "../functions/mailAsset";
import client from "../../postgresConfig";

async function consumeAssetNotifications() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://rabbitmq');
        const channel = await connection.createChannel();
        const queue = 'asset_notification_queue';

        await channel.assertQueue(queue, { durable: true });
        console.log(`Listening to ${queue}...`);

        channel.consume(queue, async (message) => {
            if (message) {
                const notificationData = JSON.parse(message.content.toString());
                let assetId = notificationData.assetId
                let userId = notificationData.userId
                let user = (await client.query("select * from users where id=$1 and archived_at is null",[userId])).rows[0]
                let asset = (await client.query("select * from assets where id=$1 and archived_at is null",[assetId])).rows[0]
                if(user && asset) {
                    await mailAsset(
                        user.email,
                        notificationData.sub,
                        asset.config,
                        asset.name,
                        asset.asset_type,
                        notificationData.title
                    );
                }

                channel.ack(message);
            }
        });
    } catch (error) {
        console.error('Error consuming asset notifications:', error);
    }
}

consumeAssetNotifications();
