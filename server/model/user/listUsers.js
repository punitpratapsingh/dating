import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';
import UserModel from '../../schemas/user';
import UserInterestModel from '../../schemas/userInterest';
import { INVITE_ACTIONS } from '../../constants';
/**
 * @description service model function to handle the listing of users for another user
 * @author gurlal
 * @since 3 Oct, 2019
 *
 */
export default ({
	id,
	radius = 999,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		const [userInterests] = await UserInterestModel.aggregate([
			{
				$match: {
					userRef: Types.ObjectId.createFromHexString(id),
				},
			},
			{
				$lookup:
				{
					from: 'interests',
					localField: 'interestRef',
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
				$group:
				{
					_id: '$_id',
					interestIds: {
						$push: {
							_id: '$interests._id',
						},
					},
				},
			},
		]);
		const userInterestIds = [];
		if (userInterestIds.length) {
			userInterests.interestIds.forEach((element) => {
				userInterestIds.push(element._id);
			});
		}
		const matchQuery = {
			$match: {
				$and: [
					{ _id: { $ne: Types.ObjectId.createFromHexString(id) } },
					{ age: { $gte: user.ageRangeLow } },
					{ age: { $lte: user.ageRangeHigh } },
					// { ageRangeLow: { $lte: user.age } },
					// { ageRangeHigh: { $gte: user.age } },
					// { gender: { $eq: user.interestedIn } },
					// { interestedIn: { $eq: user.gender } },
				],
			},
		};
		if (user.interestedIn < 3) {
			matchQuery.$match.$and.push({ gender: { $eq: user.interestedIn } });
		}
		const todayDate = new Date().getTime();
		const oneDayTimestamp = todayDate - 86400000;
		const oneWeekstamp = todayDate - (86400000 * 7);
		const users = await UserModel.aggregate([
			{
				$geoNear: {
					near: { type: 'Point', coordinates: [user.location.coordinates[1], user.location.coordinates[0]] },
					distanceField: 'distance',
					key: 'location',
					maxDistance: 1609.34 * radius,
					spherical: true,
				},
			},
			matchQuery,
			{
				$lookup:
				{
					from: 'invites',
					localField: '_id',
					foreignField: 'toUser',
					as: 'invites',
				},
			},
			{
				$unwind:
				{
					path: '$invites',
					preserveNullAndEmptyArrays: true,
				},
			},
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
					distance: { $first: '$distance' },
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
							createdOn: '$interests.createdOn',
							updatedOn: '$interests.updatedOn',
							picture: '$interests.picture',
							match: {
								$cond: [
									{
										$in: ['$interests._id', userInterestIds],
									},
									true,
									false,
								],
							},
						},
					},
					matchingInterests: {
						$push: {
							$cond: [
								{
									$in: ['$interests._id', userInterestIds],
								},
								{ _id: '$interests._id' },
								null,
							],
						},
					},
					pendingInvites: {
						$push: {
							$cond: [
								{
									$or: [
										{
											$and:
											[
												{ $eq: ['$invites.fromUser', Types.ObjectId.createFromHexString(id)] },
												{ $eq: ['$invites.status', INVITE_ACTIONS.REJECTED] },
												{ $gt: ['$invites.createdOn', oneDayTimestamp] },
											],
										},
										{
											$and:
											[
												{ $eq: ['$invites.fromUser', Types.ObjectId.createFromHexString(id)] },
												{ $ne: ['$invites.status', INVITE_ACTIONS.REJECTED] },
												{ $gt: ['$invites.createdOn', oneWeekstamp] },
											],
										},
									],
								},
								{ _id: '$invites._id' },
								null,
							],
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
					distance: '$distance',
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
					interests: {
						$filter: {
							input: '$interests',
							as: 'interests',
							cond: { $gt: ['$$interests._id', null] },
						},
					},
					matchingInterests: {
						$filter: {
							input: '$matchingInterests',
							as: 'matchingInterests',
							cond: { $gt: ['$$matchingInterests._id', null] },
						},
					},
					pendingInvites: { $setUnion: ['$pendingInvites._id', []] },
				},
			},
			{
				$match: {
					disliked: false,
				},
			},
			{
				$project: {
					_id: '$_id',
					location: '$location',
					dob: '$dob',
					firstName: '$firstName',
					lastName: '$lastName',
					distance: '$distance',
					email: '$email',
					gender: '$gender',
					age: '$age',
					jobTitle: '$jobTitle',
					interestedIn: '$interestedIn',
					ageRangeLow: '$ageRangeLow',
					ageRangeHigh: '$ageRangeHigh',
					about: '$about',
					favPlace: '$favPlace',
					liked: '$liked',
					disliked: '$disliked',
					freeTimeActivity: '$freeTimeActivity',
					interests: '$interests',
					pictureOne: '$pictureOne',
					pictureTwo: '$pictureTwo',
					pictureThree: '$pictureThree',
					pictureFour: '$pictureFour',
					pictureFive: '$pictureFive',
					pictureSix: '$pictureSix',
					totalInterests: { $size: '$interests' },
					matchingInterests: { $size: '$matchingInterests' },
					pendingInvites: { $size: '$pendingInvites' },
				},
			},
			// {
			// 	$match:
			// 		{
			// 			pendingInvites: { $eq: 0 },
			// 		},
			// },
			{
				$sort:
				{
					distance: 1,
					matchingInterests: 1,
				},
			},
		]);
		return resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: users,
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: err.message }));
	}
});
