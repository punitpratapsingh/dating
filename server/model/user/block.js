import { ResponseUtility } from 'appknit-backend-bundle';
import  UserModel  from '../../schemas/user';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 13:52:41
*/
/* eslint-disable import/named */

export default ({
	userId,
	blocked,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!userId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is id required userId is missing' }));
		}
		const lookUpQuery = { _id: userId, blocked: !blocked };
		const updateQuery = { blocked };
		await UserModel.findByIdAndUpdate(lookUpQuery, updateQuery);
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});


