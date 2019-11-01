/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { UserModel } from '../../schemas';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 13:53:24
*/

export default ({ userId }) => new Promise(async (resolve, reject) => {
	try {
		if (!userId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is required property missing userId' }));
		}
		const lookUpQuery = { _id: userId, deleted: false };
		const updateQuery = { deleted: true };
		await UserModel.findByIdAndUpdate(lookUpQuery, updateQuery, { new: true });
		resolve(ResponseUtility.SUCCESS());
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});


