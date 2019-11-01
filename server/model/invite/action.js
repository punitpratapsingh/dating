import {
	ResponseUtility,
	SchemaMapperUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import InviteModel from '../../schemas/invite';
import MatchModel from '../../schemas/match';
import UserModel from '../../schemas/user';
import NotificationModel from '../../schemas/notification';
import {
	INVITE_ACTIONS, NOTIFICATION_TYPE, AMQP_QUEUES, MATCHES_WITHOUT_SUB, INVITE_EXPIRE_TIME,
} from '../../constants';

/**
 * @description service model function to handle the creation
 * of Invites
 * @author gurlal
 * @since 7 Oct, 2019
*/
export default ({
	id,
	inviteId,
	action,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (action < INVITE_ACTIONS.ACCEPTED || action > INVITE_ACTIONS.REJECTED) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Action.' }));
		}
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const invite = await InviteModel.findOne({
			_id: inviteId,
			toUser: id,
			status: INVITE_ACTIONS.PENDING,
		});
		if (!invite) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invitation.' }));
		}
		const dateNowTimeStamp = new Date().getTime();
		const timeInterval = dateNowTimeStamp - invite.createdOn;
		const days = timeInterval / 86400000;
		if (days > INVITE_EXPIRE_TIME) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invite is expired.' }));
		}
		const updateQuery = await SchemaMapperUtility({
			status: action,
			updatedOn: new Date(),
		});
		await InviteModel.findOneAndUpdate(
			{ _id: inviteId },
			updateQuery,
		);
		let message;
		if (action === INVITE_ACTIONS.ACCEPTED) {
			message = 'Invitation Accepted.';
			const otherUser = await UserModel.findOne({ _id: invite.fromUser });
			if (!otherUser) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
			}
			const dateNow = new Date();
			const dateLimit = new Date(dateNow.getFullYear(),
				dateNow.getMonth(),
				dateNow.getDate(),
				0,
				0,
				0,
				0);
			const dateLimitTimestamp = dateLimit.getTime();
			const matchesToday = await MatchModel.find({
				fromUser: otherUser._id,
				createdOn: { $gt: dateLimitTimestamp },
			});
			let type = NOTIFICATION_TYPE.INVITE_ACCEPTED;
			if (matchesToday <= MATCHES_WITHOUT_SUB) {
				const MatchObject = new MatchModel({
					toUser: id,
					fromUser: otherUser._id,
					createdOn: new Date(),
					updatedOn: new Date(),
				});
				await MatchObject.save();
				type = NOTIFICATION_TYPE.MATCH;
			}
			// if (otherUser.fcmToken) {
			const notification = new NotificationModel({
				ref: inviteId,
				type,
				text: 'has accpted your Request.',
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
					subtitle: 'has accpted your Request.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.INVITE_ACCEPTED,
					picture: user.picture,
				})),
			);
			// }
		}
		if (action === INVITE_ACTIONS.REJECTED) {
			message = 'Invitation Rejected.';
		}
		return resolve(ResponseUtility.SUCCESS({ message }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error taking action on Invites.', error: `${err}` }));
	}
});
