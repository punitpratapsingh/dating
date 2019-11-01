import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import InviteModel from '../../schemas/invite';
import UserModel from '../../schemas/user';

/**
 * @description service model function to handle the creation
 * of Invites
 * @author gurlal
 * @since 7 Oct, 2019
*/
export default ({
	id,
	listType = 1,
	inviteId,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const matchQuery = {
			$match: {
			},
		};
		if (listType === 1) {
			matchQuery.$match.toUser = Types.ObjectId.createFromHexString(id);
		} else if (listType === 2) {
			matchQuery.$match.fromUser = Types.ObjectId.createFromHexString(id);
		}
		if (inviteId) {
			matchQuery.$match._id = Types.ObjectId.createFromHexString(inviteId);
		}
		const invites = await InviteModel.aggregate([
			matchQuery,
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
					status: '$status',
					toUser: {
						_id: '$toUser._id',
						firstName: '$toUser.firstName',
						lastName: '$toUser.lastName',
						gender: '$toUser.gender',
						dob: '$toUser.dob',
						interestedIn: '$toUser.interestedIn',
						ageRangeLow: '$toUser.ageRangeLow',
						ageRangeHigh: '$toUser.ageRangeHigh',
						age: '$toUser.age',
						about: '$toUser.about',
						jobTitle: '$toUser.jobTitle',
						favPlace: '$toUser.favPlace',
						freeTimeActivity: '$toUser.freeTimeActivity',
					},
					fromUser: {
						_id: '$fromUser._id',
						firstName: '$fromUser.firstName',
						lastName: '$fromUser.lastName',
						gender: '$fromUser.gender',
						dob: '$fromUser.dob',
						interestedIn: '$fromUser.interestedIn',
						ageRangeLow: '$fromUser.ageRangeLow',
						ageRangeHigh: '$fromUser.ageRangeHigh',
						age: '$fromUser.age',
						about: '$fromUser.about',
						jobTitle: '$fromUser.jobTitle',
						favPlace: '$fromUser.favPlace',
						freeTimeActivity: '$fromUser.freeTimeActivity',
					},
					text: { $ifNull: ['$text', ' '] },
					location: { $ifNull: ['$location', ' '] },
					date: { $ifNull: ['$date', ' '] },
					time: { $ifNull: ['$time', ' '] },
					reLocation: { $ifNull: ['$reLocation', ' '] },
					reDate: { $ifNull: ['$reDate', ' '] },
					reTime: { $ifNull: ['$reTime', ' '] },
					splitBill: { $ifNull: ['$splitBill', ' '] },
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
				},
			},
		]);

		return resolve(ResponseUtility.SUCCESS({ data: invites }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing Invites.', error: `${err}` }));
	}
});
