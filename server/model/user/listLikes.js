import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import LikeModel from '../../schemas/like';

/**
 * @description service model function to handle the listing of users for another user
 * @author gurlal
 * @since 3 Oct, 2019
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
		const users = await LikeModel.aggregate([
			{
				$match: {
					likedUser: Types.ObjectId.createFromHexString(id),
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
				$project: {
					createdOn: '$createdOn',
					updatedOn: '$updatedOn',
					firstName: '$user.firstName',
					lastName: '$user.lastName',
					email: '$user.email',
					userId: '$user._id',
					pictureOne: '$user.pictureOne',
					pictureTwo: '$user.pictureTwo',
					pictureThree: '$user.pictureThree',
					pictureFour: '$user.pictureFour',
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: users,
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing likes.', error: err.message }));
	}
});
