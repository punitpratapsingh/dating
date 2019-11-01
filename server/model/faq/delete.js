/* eslint-disable import/named */
import { ResponseUtility } from 'appknit-backend-bundle';
import { QuestionModel } from '../../schemas';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 16:51:24
*/
export default ({
	questionId,
}) => new Promise(async (resolve, reject) => {
	try {
		const question = await QuestionModel.findOne({ _id: questionId });
		if (!question) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No question Found.' }));
		}
		await QuestionModel.deleteOne({ _id: questionId });
		return resolve(ResponseUtility.SUCCESS({
			message: 'Question Deleted Successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error deleting question.', error: err }));
	}
});
