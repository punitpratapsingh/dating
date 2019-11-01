/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { QuestionModel }  from '../../schemas';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 16:45:14
*/
export default ({ question, answer }) => new Promise(async (resolve, reject) => {
	try {
		// write your code here.....
		if (!(question && answer)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'There is required question and answer' }))
		}
		const questionObject = new QuestionModel({
			question,
			answer,
		});
		await questionObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Question Created Successfully.' }));

	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error', error: err.message }));
	}
});
