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
 * @description service model function to handle the confirmation
 * of Invite request
 * @author gurlal
 * @since 8 Oct, 2019
*/
export default ({
	id,
	inviteId,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!inviteId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const invite = await InviteModel.findOne({
			_id: inviteId,
		});
		if (!invite
            || invite.status < INVITE_ACTIONS.SHECHDULED
            || invite.status > INVITE_ACTIONS.RESHECHDULED) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
		}
		if (invite.status === INVITE_ACTIONS.SHECHDULED) {
			if (invite.toUser.toString() !== id) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
			}
		}
		if (invite.status === INVITE_ACTIONS.RESHECHDULED) {
			if (invite.fromUser.toString() !== id) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
			}
		}
		const updateQuery = await SchemaMapperUtility({
			status: INVITE_ACTIONS.CONFIRMED,
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
				type: NOTIFICATION_TYPE.CONFIRM_REQUEST,
				text: 'has confirmed your dating Request.',
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
					subtitle: 'has confirmed your dating Request.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.CONFIRM_REQUEST,
					picture: user.picture,
				})),
			);
		// }
		return resolve(ResponseUtility.SUCCESS({ message: 'Date Confirmed successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error Confirming Date.', error: `${err}` }));
	}
});
