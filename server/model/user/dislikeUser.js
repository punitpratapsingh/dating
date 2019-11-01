import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import DislikeModel from '../../schemas/dislike';
import LikeModel from '../../schemas/like';
/**
 * @description to dislike a user.
 * @author gurlal
 * @since 11 Oct, 2019
 */
export default ({
	id,
	userId,
	action,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		const otherUser = await UserModel.findOne({ _id: userId });
		if (!(user && otherUser)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const alreadyDisliked = await DislikeModel.findOne({
			userRef: id,
			dislikedUser: userId,
		});
		let message = '';
		if (action === 1) {
			if (alreadyDisliked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You have already disliked this user.' }));
			}
			const DislikeObject = new DislikeModel({
				userRef: id,
				dislikedUser: userId,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			await DislikeObject.save();
			await LikeModel.deleteOne({
				userRef: id,
				dislikedUser: userId,
			});
			message = 'User disliked successfully.';
		} else if (action === 2) {
			if (!alreadyDisliked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You have not disliked this user.' }));
			}
			await DislikeModel.deleteOne({
				userRef: id,
				dislikedUser: userId,
			});
			message = 'Dislike is removed successfully.';
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Action.' }));
		}
		return resolve(ResponseUtility.SUCCESS({
			message,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while disliking User.', error: `${err}` }));
	}
});
