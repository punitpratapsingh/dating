import { ResponseUtility } from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
/**
 * @description to get details of user.
 * @author gurlal
 * @since 28 Sep, 2019
 * @param {String} id the unique id of the user who is requesting to see profile details.
 */
export default ({
	id,
	userId,
}) => new Promise(async (resolve, reject) => {
	try {
		const lookupQuery = {
			$match:
			{
				deleted: false,
			},
		};
		if (userId) {
			lookupQuery.$match._id = Types.ObjectId.createFromHexString(userId);
		} else {
			lookupQuery.$match._id = Types.ObjectId.createFromHexString(id);
		}
		let selfProfile = false;
		selfProfile = userId ? (userId === id) : true;
		const [user] = await UserModel.aggregate([
			lookupQuery,
			{
				$lookup:
				{
					from: 'userinterests',
					localField: '_id',
					foreignField: 'userRef',
					as: 'userinterests',
				},
			},
			{
				$unwind:
				{
					path: '$userinterests',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup:
				{
					from: 'interests',
					localField: 'userinterests.interestRef',
					foreignField: '_id',
					as: 'interests',
				},
			},
			{
				$unwind:
				{
					path: '$interests',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup:
				{
					from: 'likes',
					localField: '_id',
					foreignField: 'likedUser',
					as: 'like',
				},
			},
			{
				$unwind:
				{
					path: '$like',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$lookup:
				{
					from: 'dislikes',
					localField: '_id',
					foreignField: 'dislikedUser',
					as: 'dislike',
				},
			},
			{
				$unwind:
				{
					path: '$dislike',
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$group:
				{
					_id: '$_id',
					location: { $first: '$location' },
					dob: { $first: '$dob' },
					firstName: { $first: '$firstName' },
					lastName: { $first: '$lastName' },
					email: { $first: '$email' },
					gender: { $first: '$gender' },
					age: { $first: '$age' },
					jobTitle: { $first: '$jobTitle' },
					interestedIn: { $first: '$interestedIn' },
					ageRangeLow: { $first: '$ageRangeLow' },
					ageRangeHigh: { $first: '$ageRangeHigh' },
					about: { $first: '$about' },
					favPlace: { $first: '$favPlace' },
					freeTimeActivity: { $first: '$freeTimeActivity' },
					totalInterests: { $sum: 1 },
					pictureOne: { $first: { $ifNull: ['$pictureOne', ' '] } },
					pictureTwo: { $first: { $ifNull: ['$pictureTwo', ' '] } },
					pictureThree: { $first: { $ifNull: ['$pictureThree', ' '] } },
					pictureFour: { $first: { $ifNull: ['$pictureFour', ' '] } },
					pictureFive: { $first: { $ifNull: ['$pictureFive', ' '] } },
					pictureSix: { $first: { $ifNull: ['$pictureSix', ' '] } },
					likes: { $push: '$like.userRef' },
					dislikes: { $push: '$dislike.userRef' },
					interests: {
						$push: {
							_id: '$interests._id',
							interest: '$interests.interest',
							picture: '$interests.picture',
							createdOn: '$interests.createdOn',
							updatedOn: '$interests.updatedOn',
						},
					},
				},
			},
			{
				$project: {
					_id: '$_id',
					location: '$location',
					dob: '$dob',
					firstName: '$firstName',
					lastName: '$lastName',
					email: '$email',
					gender: '$gender',
					age: '$age',
					jobTitle: '$jobTitle',
					interestedIn: '$interestedIn',
					ageRangeLow: '$ageRangeLow',
					ageRangeHigh: '$ageRangeHigh',
					about: '$about',
					favPlace: '$favPlace',
					freeTimeActivity: '$freeTimeActivity',
					totalInterests: '$totalInterests',
					pictureOne: '$pictureOne',
					pictureTwo: '$pictureTwo',
					pictureThree: '$pictureThree',
					pictureFour: '$pictureFour',
					pictureFive: '$pictureFive',
					pictureSix: '$pictureSix',
					liked: {
						$in: [Types.ObjectId.createFromHexString(id), '$likes'],
					},
					disliked: {
						$in: [Types.ObjectId.createFromHexString(id), '$dislikes'],
					},
					interests: '$interests',
				},
			},
		]);
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		return resolve(ResponseUtility.SUCCESS({
			data: {
				...user,
				selfProfile,
			},
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error while getting user details.', error: `${err}` }));
	}
});
