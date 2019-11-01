/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { QuestionModel }  from '../../schemas';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 17:16:39
*/
export default ({
	limit = 30,
	page = 1,
}) => new Promise(async (resolve, reject) => {
	try {
		const questions = await QuestionModel.find({});
		return resolve(ResponseUtility.SUCCESS_PAGINATION({ data: questions, page, limit }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error listing questions.', error: err }));
	}
});

