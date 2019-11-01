import { FirebasePushNotificationService } from 'appknit-backend-bundle';

/**
 * the consumer function to handle the notification process.
 * @author SantGurlal Singh
 * @since 4 sep, 2019
 *
 * @param {Object} channel is the channel created using AMQP connection
 * application
 * The content payload that contains the following values:
 */
export default async ({
	deviceId,
	device,
	reference,
	title,
	subtitle,
	type,
	picture,
}) => {
	console.log('sending notification');
	await FirebasePushNotificationService({
		deviceId,
		device,
		reference,
		title,
		subtitle,
		type,
		picture,
	});
	console.log('notification sent');
};
