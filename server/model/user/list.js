import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import LikeModel from '../../schemas/like';
/**
 * @description to like a user.
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
		const alreadyLiked = await LikeModel.findOne({
			userRef: id,
			likedUser: userId,
		});
		let message = '';
		if (action === 1) {
			if (alreadyLiked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You have already liked this user.' }));
			}
			const LikeObject = new LikeModel({
				userRef: id,
				likedUser: userId,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			await LikeObject.save();
			message = 'User liked successfully.';
		} else if (action === 2) {
			if (!alreadyLiked) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'You have not liked this user.' }));
			}
			await LikeModel.deleteOne({
				userRef: id,
				likedUser: userId,
			});
			message = 'Like is removed successfully.';
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Action.' }));
		}
		return resolve(ResponseUtility.SUCCESS({
			message,
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while liking User.', error: `${err}` }));
	}
});
