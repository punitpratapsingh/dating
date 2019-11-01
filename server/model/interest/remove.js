import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	InterestModel,
	UserModel,
	UserInterestModel,
} from '../../schemas';

/**
 * @description service model function to handle the removal
 * of Interests from userInterests
 * @author gurlal
 * @since 3 Oct, 2019
*/
export default ({
	id,
	interests,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user Found.' }));
		}
		if (!interests || !interests.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property' }));
		}
		const alreadyLinkedPromises = [];
		interests.forEach((element) => {
			alreadyLinkedPromises.push(UserInterestModel({ interestRef: element, userRef: id }));
		});
		let alreadyLinkedInterest = await Promise.all(alreadyLinkedPromises);
		alreadyLinkedInterest = alreadyLinkedInterest.filter(element => element != null);
		if (alreadyLinkedInterest.length !== interests.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Some of the Interests are not added to your profile.' }));
		}
		const deletePromises = [];
		interests.forEach((element) => {
			deletePromises.push(UserInterestModel.deleteone({
				interestRef: element,
				userRef: id,
			}));
		});
		await Promise.all(deletePromises);
		return resolve(ResponseUtility.SUCCESS({ message: 'Interests Removed Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error removing Interest.', error: `${err}` }));
	}
});
