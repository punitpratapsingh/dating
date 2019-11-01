/* eslint-disable import/named */
import { ResponseUtility, SchemaMapperUtility } from 'appknit-backend-bundle';
import { QuestionModel } from '../../schemas';
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 17:18:14
*/
export default ({
	questionId,
	question,
	answer,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!questionId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property questionId.' }));
		}
		if (!(question || answer)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Please provide something to Update' }));
		}
		const matchQuery = { _id: questionId };
		const questionExists = await QuestionModel.findOne({ _id: questionId });
		if (!questionExists) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No question Found.' }));
		}
		const updateQuery = await SchemaMapperUtility({
			question,
			answer,
			lastUpdated: new Date(),
		});
		await QuestionModel.findOneAndUpdate(
			matchQuery,
			updateQuery,
			{ new: true },
		);
		return resolve(ResponseUtility.SUCCESS({
			message: 'question Updated Successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error updating question.', error: err }));
	}
});

