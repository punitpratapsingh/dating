import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	InterestModel,
	UserInterestModel,
} from '../../schemas';
/**
 * @description service model function to handle the deletion
 * of interest
 * @author gurlal
 * @since 3 Oct, 2019
 * @param {String} interestId unique id of interest.
 */
export default ({
	interestId,
}) => new Promise(async (resolve, reject) => {
	try {
		console.log(interestId);
		const interest = await InterestModel.findOne({ _id: interestId });
		if (!interest) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No interest Found.' }));
		}
		await InterestModel.deleteOne({ _id: interestId });
		await UserInterestModel.deleteMany({ interestRef: interestId });
		return resolve(ResponseUtility.SUCCESS({
			message: 'Interest Deleted Successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error deleting Interest.', error: err }));
	}
});
