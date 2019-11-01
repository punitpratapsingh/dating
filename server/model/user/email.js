/*
 * File for sending token to change/update password
 * @author Punit
 * @since  05 Jan 2019
 */
import {
	ResponseUtility,
	EmailServices,
} from 'appknit-backend-bundle';

import UserModel from '../../schemas/user';

export default ({ email, text }) => new Promise(async (resolve, reject) => {

	// check given email id user database to send email with text
	const query = { email };
	const registered = await UserModel.findOne(query);
	if (!registered) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Requested email id is not registered on the platform.' }));
	}

	/**
	 * send the email with text
	 */
	try {
		await EmailServices({ to: email, text: ` ${text}`, subject: 'Email from hide&seek admin' });
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'Error sending email', error: err }));
	}

	/**
	 * Update the user schema with the verificationToken and timestamp
	 */
	return resolve(ResponseUtility.SUCCESS());
});
