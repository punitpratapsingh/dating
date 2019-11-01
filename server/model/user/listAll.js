/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 13:51:29
*/

export default ({
	page = 1,
	limit = 30,
}) => new Promise(async (resolve, reject) => {
	try {
		const options = { skip: limit * (page - 1), limit };
		const users = await UserModel.find(
			{ $or: [{ deleted: undefined }, { deleted: false }] },
			{ __v: 0 },
			options,
		);
		const refactoredResponses = [];

		users.map(user => refactoredResponses.push(Object.assign({}, { ...user._doc })));
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: refactoredResponses, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ error: err.error, message: err.message }));
	}
});

