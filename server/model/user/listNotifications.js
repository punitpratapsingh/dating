import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import NotificationModel from '../../schemas/notification';

/**
 * @description service model function to handle the listing of notifications
 * @author gurlal
 * @since 8 Oct, 2019
 *
 */
export default ({
	id,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const notifications = await NotificationModel.aggregate([
			{
				$match: {
					notificationFor: Types.ObjectId.createFromHexString(id),
				},
			},
			{
				$lookup:
				{
					from: 'users',
					localField: 'userRef',
					foreignField: '_id',
					as: 'user',
				},
			},
			{
				$unwind:
				{
					path: '$user',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project:
				{
					_id: '$_id',
					type: '$type',
					text: '$text',
					boldText: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
					timestamp: '$timestamp',
					date: '$date',
					userRef: '$userRef',
					ref: '$ref',
					notificationFor: '$notificationFor',
					picture: '$user.pictureOne',
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS({
			data: notifications,
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing notifications.', error: err.message }));
	}
});
