import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import InviteModel from '../../schemas/invite';
import UserModel from '../../schemas/user';
import NotificationModel from '../../schemas/notification';
import { INVITE_ACTIONS, AMQP_QUEUES, NOTIFICATION_TYPE } from '../../constants';

/**
 * @description service model function to handle the scheduling
 * of Invite request
 * @author gurlal
 * @since 7 Oct, 2019
*/
export default ({
	id,
	inviteId,
	day,
	month,
	year,
	hour,
	minute,
	location,
	coordinates,
	splitBill = 2,
	note,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!(inviteId && day && month && year && hour && minute && location && coordinates)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const invite = await InviteModel.findOne({
			_id: inviteId,
			fromUser: id,
			status: INVITE_ACTIONS.ACCEPTED,
		});
		if (!invite) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
		}
		const updateQuery = await SchemaMapperUtility({
			status: INVITE_ACTIONS.SHECHDULED,
			location: (location && coordinates)
				? {
					location,
					type: 'Point',
					coordinates: [coordinates[0], coordinates[1]],
				} : undefined,
			date: {
				day,
				month,
				year,
			},
			time: {
				hour,
				minute,
			},
			splitBill,
			note,
			updatedOn: new Date(),
		});
		await InviteModel.findOneAndUpdate(
			{ _id: inviteId },
			updateQuery,
		);
		const otherUser = await UserModel.findOne({ _id: invite.toUser });
		// if (otherUser.fcmToken) {
			const notification = new NotificationModel({
				ref: inviteId,
				type: NOTIFICATION_TYPE.SCHEDULE_DATE,
				text: 'has sent a dating Request.',
				boldText: `${user.firstName} ${user.lastName}`,
				date: new Date(),
				timestamp: new Date(),
				userRef: id,
				notificationFor: otherUser._id,
			});
			await notification.save();
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.NOTIFICATION,
				Buffer.from(JSON.stringify({
					fcmToken: otherUser.fcmToken,
					device: otherUser.device,
					ref: inviteId,
					subtitle: 'has sent a dating Request.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.SCHEDULE_DATE,
					picture: user.picture,
				})),
			);
		// }
		return resolve(ResponseUtility.SUCCESS({ message: 'Date Scheduled successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error Scheduling Date.', error: `${err}` }));
	}
});
