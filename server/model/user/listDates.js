import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import InviteModel from '../../schemas/invite';
import { INVITE_ACTIONS } from '../../constants';

/**
 * @description service model function to handle the listing of scheduled dates
 * @author gurlal
 * @since 9 Oct, 2019
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
		const dates = await InviteModel.aggregate([
			{
				$match:
				{
					$or: [
						{
							fromUser: { $eq: Types.ObjectId.createFromHexString(id) },
						},
						{
							toUser: { $eq: Types.ObjectId.createFromHexString(id) },
						},
					],
					status: { $gte: INVITE_ACTIONS.CONFIRMED },
				},
			},
			{
				$lookup:
				{
					from: 'users',
					localField: 'toUser',
					foreignField: '_id',
					as: 'toUser',
				},
			},
			{
				$unwind:
				{
					path: '$toUser',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup:
				{
					from: 'users',
					localField: 'fromUser',
					foreignField: '_id',
					as: 'fromUser',
				},
			},
			{
				$unwind:
				{
					path: '$fromUser',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project:
				{
					_id: '$_id',
					user: {
						$cond: [
							{
								$eq: ['$fromUser._id', Types.ObjectId.createFromHexString(id)],
							},
							{
								_id: '$toUser._id',
								firstName: '$toUser.firstName',
								lastName: '$toUser.lastName',
								pictureOne: '$toUser.pictureOne',
								pictureTwo: '$toUser.pictureTwo',
								pictureThree: '$toUser.pictureThree',
								pictureFour: '$toUser.pictureFour',
							},
							{
								_id: '$fromUser._id',
								firstName: '$fromUser.firstName',
								lastName: '$fromUser.lastName',
								pictureOne: '$fromUser.pictureOne',
								pictureTwo: '$fromUser.pictureTwo',
								pictureThree: '$fromUser.pictureThree',
								pictureFour: '$fromUser.pictureFour',
							},
						],
					},
					status: { type: Number, default: 1 },
					text: '$text',
					date: '$date',
					time: '$time',
					reDate: '$reDate',
					reTime: '$reTime',
					location: '$location',
					reLocation: '$reLocation',
					splitBill: '$splitBill',
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS({
			data: dates,
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing dates.', error: err.message }));
	}
});
