
import {
	ResponseUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import {
	SOCIAL_IDENTIFIER,
} from '../../constants';
import { FacebookVerificationUtility } from '../../utility';
import UserModel from '../../schemas/user';

/**
 * @description the social login handler
 * @author gurlal
 * @since 14 Oct, 2019
 * @param {String} socialId the social id of the user.
 * @param {String} socialToken the social token of the user.
 * @param {String} socialIdentifier to see what social media platform user is using to login.
 * @param {String} fcmToken fcmToken of user's device for notifications.
 * @param {Boolean} termsAction if user has accepted the terms or not.
 */
export default ({
	socialId,
	socialToken,
	socialIdentifier,
	firstName,
	lastName,
	email,
	password,
	gender,
	location,
	day,
	month,
	year,
	interestedIn,
	ageRangeLow,
	ageRangeHigh,
	fcmToken,
	device,
}) => new Promise(async (resolve, reject) => {
	const platform = '';
	try {
		if (socialIdentifier === SOCIAL_IDENTIFIER.FB) {
			if (!socialId || !socialToken) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Missing required properties socialId or socialToken' }));
			}
			const fbVerification = await FacebookVerificationUtility({ accessToken: socialToken });
			if (fbVerification.data.id !== socialId.toString()) {
				return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Id' }));
			}
			platform = 'Facebook';
		} else if (socialIdentifier === SOCIAL_IDENTIFIER.LI) {
			platform = 'LinkedIn';
		} else {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'Invalid Social Identifier' }));
		}
		// check if social user id already exist
		const lookupQuery = { socialId };
		const userExists = await UserModel.findOne(lookupQuery);
		if (userExists) {
			const { _id } = userExists;
			/**
		 * update the fcmToken for the user
		 */
			if (fcmToken) {
				await UserModel.findOneAndUpdate(lookupQuery, { fcmToken, device });
			}
			return resolve(ResponseUtility.SUCCESS({
				data:
				{
					user: {
						...userExists._doc,
						isVerified: undefined,
						blocked: undefined,
						deleted: undefined,
						password: undefined,
						emailToken: undefined,
						emailTokenDate: undefined,
						updatedOn: undefined,
						createdOn: undefined,
					},
					accessToken: TokenUtility.generateToken({ id: _id.toString(), role: 'user' }),
					isNewUser: false,
				},
			}));
		}
		// create new user
		// new user object via social login save in user db
		const userObject = new UserModel({
			firstName,
			lastName,
			email,
			password,
			gender,
			location,
			day,
			month,
			year,
			interestedIn,
			ageRangeLow,
			ageRangeHigh,
			fcmToken,
			device,
			socialId,
			socialToken,
			socialIdentifier,
			isVerified: true,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		const userDetails = await userObject.save();
		return resolve(ResponseUtility.SUCCESS({
			data:
			{
				accessToken: TokenUtility.generateToken({ id: userObject._id.toString(), role: 'user' }),
				isNewUser: true,
				user: {
					...userDetails._doc,
					isVerified: undefined,
					blocked: undefined,
					deleted: undefined,
					password: undefined,
					emailToken: undefined,
					emailTokenDate: undefined,
					updatedOn: undefined,
					createdOn: undefined,
				},
			},
		}));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: `There was some error doing ${platform} login`, error: err.message }));
	}
});
