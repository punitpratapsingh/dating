import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import { Types } from 'mongoose';

import InterestModel from '../../schemas/interest';
/**
 * @description service model function to handle the listing
 * of interests
 * @author gurlal
 * @since 3 Oct, 2019
 */
export default ({
	limit = 30,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const interests = await InterestModel.find({});
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: interests, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing interests.', error: err }));
	}
});
