import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import InviteModel from '../../schemas/invite';
import UserModel from '../../schemas/user';
import NotificationModel from '../../schemas/notification';
import {
	NOTIFICATION_TYPE, AMQP_QUEUES, INVITES_WITHOUT_SUB, INVITE_ACTIONS,
} from '../../constants';

/**
 * @description service model function to handle the creation
 * of Invites
 * @author gurlal
 * @since 4 Oct, 2019
 * @param {String} users
 * @param {String} text
*/
export default ({
	id,
	users,
	text,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		if (!(users && users.length && text)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property' }));
		}
		if (users.length > INVITES_WITHOUT_SUB) {
			return reject(ResponseUtility.MISSING_PROPS({ message: `Can't send invite to more than ${INVITES_WITHOUT_SUB} people.` }));
		}
		const getUserInfoPromises = [];
		users.forEach((element) => {
			getUserInfoPromises.push(UserModel.findOne({ _id: element }));
		});
		if (users.includes(id)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Cannot send invite to yourself.' }));
		}
		const uniqueUsers = [...new Set(users)];
		if (uniqueUsers.length !== users.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Duplicate userIds in array.' }));
		}
		let usersInfromation = await Promise.all(getUserInfoPromises);
		usersInfromation = usersInfromation.filter(element => element != null);
		if (users.length !== usersInfromation.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Corrupted data.' }));
		}
		const pendingInvitesPromises = [];
		const todayDate = new Date().getTime();
		const oneDayTimestamp = todayDate - 86400000;
		const oneWeekstamp = todayDate - (86400000 * 7);
		users.forEach((element) => {
			pendingInvitesPromises.push(InviteModel.findOne(
				{
					fromUser: id,
					toUser: element,
					$or: [
						{
							$and:
							[{ status: INVITE_ACTIONS.REJECTED },
								{ createdOn: { $gt: oneDayTimestamp } },
							],
						},
						{
							$and:
							[{ status: { $ne: INVITE_ACTIONS.REJECTED } },
								{ createdOn: { $gt: oneWeekstamp } },
							],
						},
					],
				},
			));
		});
		let pendingInvites = await Promise.all(pendingInvitesPromises);
		pendingInvites = pendingInvites.filter(element => element != null);
		console.log(pendingInvites);
		// if (pendingInvites.length) {
		// 	return reject(ResponseUtility.MISSING_PROPS({ message: 'You can\'t send invite to some of the selected users.' }));
		// }
		// const invitesExist = await InviteModel.findOne({ fromUser: id });
		// if (invitesExist) {
		// 	const date = new Date(user.invitesRefreshTime);
		// 	const dateNow = new Date();
		// 	const dateLimit = new Date(dateNow.getFullYear(),
		// 		dateNow.getMonth(),
		// 		dateNow.getDate(),
		// 		date.getHours(),
		// 		date.getMinutes(),
		// 		0,
		// 		0);
		// 	const dateLimitTimestamp = dateLimit.getTime();
		// 	const invitesToday = await InviteModel.find(
		// 		{
		// 			fromUser: id,
		// 			createdOn: { $gt: dateLimitTimestamp },
		// 		},
		// 	);
		// 	const invitesLeft = INVITES_WITHOUT_SUB - invitesToday.length;
		// 	if (!invitesLeft || (users.length > invitesLeft)) {
		// 		return reject(ResponseUtility.MISSING_PROPS({ message: `You have ${invitesLeft} invite[s] left.` }));
		// 	}
		// } else {
		// 	await UserModel.findOneAndUpdate({ _id: id }, { invitesRefreshTime: Date.now() });
		// }
		const createPromises = [];
		const notificationPromises = [];
		usersInfromation.forEach((element) => {
			const InviteObject = new InviteModel({
				toUser: element._id,
				fromUser: id,
				text,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			createPromises.push(InviteObject.save());
			const notification = new NotificationModel({
				ref: InviteObject._id,
				type: NOTIFICATION_TYPE.INVITE_RECEIVED,
				text: 'has sent you an invite.',
				boldText: `${user.firstName} ${user.lastName}`,
				date: new Date(),
				timestamp: new Date(),
				userRef: id,
				notificationFor: element._id,
			});
			notificationPromises.push(notification.save());
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.NOTIFICATION,
				Buffer.from(JSON.stringify({
					fcmToken: element.fcmToken,
					device: element.device,
					ref: InviteObject._id,
					subtitle: 'has sent you an invite.',
					title: `${user.firstName} ${user.lastName}`,
					type: NOTIFICATION_TYPE.INVITE_RECEIVED,
					picture: user.picture,
				})),
			);
		});
		await Promise.all(createPromises);
		await Promise.all(notificationPromises);
		return resolve(ResponseUtility.SUCCESS({ message: 'Invites Created Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error creating Invites.', error: `${err}` }));
	}
});
