import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import ReportModel from '../../schemas/report';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 25 October, 2019 14:29:46
*/

export default({
	page = 1,
	limit = 30,

}) => new Promise(async (resolve, reject) => {
	try {
		const reportedUsers = await ReportModel.aggregate([
			{
				$lookup: {
					from: 'users',
					localField: 'ref',
					foreignField: '_id',
					as: 'culprit',
				},
			},
			{ $unwind: { path: '$culprit' } },
			{
				$lookup: {
					from: 'users',
					localField: 'by',
					foreignField: '_id',
					as: 'initiator',
				},
			},
			{ $unwind: { path: '$initiator' } },
			{
				$project: {
					comment: '$comment',
					reason: '$reason',
					for: '$for',
					ref: {
						_id: '$culprit._id',
						name: '$culprit.name',
						blocked: '$culprit.blocked',
					},
					by: {
						_id: '$initiator._id',
						name: '$initiator.name',
					},
				},
			},
		]);
		
		 resolve(ResponseUtility.SUCCESS_PAGINATION({
			data: reportedUsers,
		}));
		console.log(reportedUsers);
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error', error: err.message }));
	}
});
