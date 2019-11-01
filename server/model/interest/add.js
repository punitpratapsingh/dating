import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import {
	InterestModel,
	UserModel,
	UserInterestModel,
} from '../../schemas';

/**
 * @description service model function to handle the linking
 * of user with interests
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
		const promises = [];
		interests.forEach((element) => {
			promises.push(InterestModel.findOne({ _id: element }));
		});
		let validInterests = await Promise.all(promises);
		validInterests = validInterests.filter(element => element != null);
		if (validInterests.length !== interests.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Data is Corrupted.' }));
		}
		const alreadyLinkedPromises = [];
		validInterests.forEach((element) => {
			alreadyLinkedPromises.push(UserInterestModel.findOne({
				interestRef: element._id,
				userRef: id,
			}));
		});
		let alreadyLinkedInterest = await Promise.all(alreadyLinkedPromises);
		alreadyLinkedInterest = alreadyLinkedInterest.filter(element => element != null);
		if (alreadyLinkedInterest.length) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Some of the Interests are already added to your profile.' }));
		}
		const createPromises = [];
		validInterests.forEach((element) => {
			const UserInterestObject = new UserInterestModel({
				interestRef: element._id,
				userRef: id,
				createdOn: new Date(),
				updatedOn: new Date(),
			});
			createPromises.push(UserInterestObject.save());
		});
		await Promise.all(createPromises);
		return resolve(ResponseUtility.SUCCESS({ message: 'Interest added Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error adding Interest.', error: `${err}` }));
	}
});
