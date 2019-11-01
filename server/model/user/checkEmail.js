import {
	ResponseUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';

/**
 * @description service model function to handle the creation
 * This is a common function that could be used to create as
 * well as update the existing user.
 * of the new user. This will handle the profile completion process
 * @author gurlal
 * @since 28 Sep, 2019
 *
 */
export default ({
	email,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!email) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing email.' }));
		}
		const checkUnique = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
		if (checkUnique) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'This email has already been used' }));
		}
		return resolve(ResponseUtility.SUCCESS({ message: 'Email is OK.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: err }));
	}
});
