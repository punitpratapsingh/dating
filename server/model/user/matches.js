/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import MatchModel from '../../schemas/match';

/**
 * @description This service model is responsible for all matches registered on system.
 * @author punit
 * @since 23 October, 2019 13:51:29
*/

export default ({

}) => new Promise(async (resolve, reject) => {
	try {
		const dates = await MatchModel.aggregate([
			{
				$lookup: {
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
				$lookup: {
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
				$project: {
					toFirstName: '$toUser.firstName',
					toLastNAme: '$toUser.lastName',
					locationTo: '$toUser.favPlace',
					picOne: '$toUser.pictureOne',
					picTwo: '$toUser.pictureTwo',
					fromFirstName: '$fromUser.firstName',
					fromLastName: '$fromUser.lastName',
					locationFrom: '$fromUser.favPlace',
					picThree: '$fromUser.pictureOne',
					picFour: '$fromUser.pictureFour',
				},
			},
		]);

		return resolve(ResponseUtility.SUCCESS({ data: dates }));


	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ error: err.error, message: err.message }));
	}
});

