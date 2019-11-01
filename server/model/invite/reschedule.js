import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import InviteModel from '../../schemas/invite';
import NotificationModel from '../../schemas/notification';
import UserModel from '../../schemas/user';
import { INVITE_ACTIONS, AMQP_QUEUES, NOTIFICATION_TYPE } from '../../constants';

/**
 * @description service model function to handle the rescheduling
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
			toUser: id,
			status: INVITE_ACTIONS.SHECHDULED,
		});
		if (!invite) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
		}
		const updateQuery = await SchemaMapperUtility({
			status: INVITE_ACTIONS.RESHECHDULED,
			reLocation: (location && coordinates)
				? {
					location,
					type: 'Point',
					coordinates: [coordinates[0], coordinates[1]],
				} : undefined,
			reDate: {
				day,
				month,
				year,
			},
			reTime: {
				hour,
				minute,
			},
			reNote: note,
			updatedOn: new Date(),
		});
		await InviteModel.findOneAndUpdate(
			{ _id: inviteId },
			updateQuery,
		);
		const otherUser = await UserModel.findOne({ _id: invite.fromUser });
		// if (otherUser.fcmToken) {
			const notification = new NotificationModel({
				ref: inviteId,
				type: NOTIFICATION_TYPE.RESCHEDULE_DATE,
				text: 'has requested to change the schedule.',
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
					subtitle: 'has requested to change the schedule.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.RESCHEDULE_DATE,
					picture: user.picture,
				})),
			);
		// }
		return resolve(ResponseUtility.SUCCESS({ message: 'Date ReScheduled successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error ReScheduling Date.', error: `${err}` }));
	}
});
