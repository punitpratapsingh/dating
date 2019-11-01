import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import RatingModel from '../../schemas/rating';
import InviteModel from '../../schemas/invite';
/**
 * @description to rate a user.
 * @author gurlal
 * @since 12 Oct, 2019
 */
export default ({
	id,
	userId,
	inviteId,
	rating,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		const otherUser = await UserModel.findOne({ _id: userId });
		if (!(user && otherUser)) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		const alreadyRated = await RatingModel.findOne({
			userRef: id,
			ratedUser: userId,
			inviteRef: inviteId,
		});
		if (alreadyRated) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'You have already rated user for this date.' }));
		}
		const invite = await InviteModel.findOne({
			_id: inviteId,
			$or: [
				{ toUser: id, fromUser: userId },
				{ toUser: userId, fromUser: id },
			],
		});
		if (!invite) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Invite.' }));
		}
		const RatingObject = new RatingModel({
			userRef: id,
			ratedUser: userId,
			inviteRef: inviteId,
			rating,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await RatingObject.save();
		return resolve(ResponseUtility.SUCCESS({
			message: 'Rating submitted successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while rating User.', error: `${err}` }));
	}
});
