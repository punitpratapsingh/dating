import {
	ResponseUtility,
	RandomCodeUtility,
	HashUtility,
	EmailServices,
	TokenUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import {
	HOST,
	AMQP_QUEUES,
} from '../../constants';

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
	firstName,
	lastName,
	email,
	password,
	gender,
	location,
	coordinates,
	day,
	month,
	year,
	interestedIn,
	ageRangeLow,
	ageRangeHigh,
	about,
	jobTitle,
	favPlace,
	freeTimeActivity,
	imageOne,
	imageTwo,
	imageThree,
	imageFour,
	imageFive,
	imageSix,
	device,
	fcmToken,
	login,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!login) {
			if (!(firstName && lastName && email && password
				&& gender && location && day && month
				&& year && interestedIn && ageRangeLow
				&& ageRangeHigh)) {
				return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing either of the required properties for signup.' }));
			}
		}

		if (login && !(email && password)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing either of the required properties for login.' }));
		}

		const checkUnique = await UserModel.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
		if (login) {
			if (checkUnique && !checkUnique.deleted) {
				const passwordMatch = await HashUtility.compare({
					text: password,
					hash: checkUnique.password,
				});
				if (!checkUnique.isVerified) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'Please verify your email id to login' }));
				}
				if (checkUnique.blocked) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'Your account has been blocked by admin' }));
				}
				if (checkUnique.deleted) {
					return reject(ResponseUtility.GENERIC_ERR({ message: 'This email has already been used' }));
				}
				if (passwordMatch) {
					const lookupQuery = { _id: checkUnique._id };
					await UserModel.updateMany({ fcmToken }, { $unset: { fcmToken: '' } });
					const updateQuery = { fcmToken, device };
					// update the fcmToken and device
					await UserModel.findOneAndUpdate(lookupQuery, updateQuery);
					const token = await TokenUtility.generateToken({
						id: checkUnique._id, email, role: 'user',
					});
					return resolve(ResponseUtility.SUCCESS({
						data: {
							accessToken: token,
							user: {
								...checkUnique._doc,
								isVerified: undefined,
								blocked: undefined,
								deleted: undefined,
								password: undefined,
								emailToken: undefined,
								emailTokenDate: undefined,
								updatedOn: undefined,
								createdOn: undefined,
								device: undefined,
								isOnTablet: undefined,
							},
						},
					}));
				}
				return reject(ResponseUtility.LOGIN_AUTH_FAILED());
			}
			return reject(ResponseUtility.NO_USER());
		}
		if (checkUnique) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'This email has already been used' }));
		}
		let imageOneName;
		let imageTwoName;
		let imageThreeName;
		let imageFourName;
		let imageFiveName;
		let imageSixName;
		if (imageOne) {
			imageOneName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageOneName,
					image: { data: imageOne },
				})),
			);
		}
		if (imageTwo) {
			imageTwoName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageTwoName,
					image: imageTwo,
				})),
			);
		}
		if (imageThree) {
			imageThreeName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageThreeName,
					image: imageThree,
				})),
			);
		}
		if (imageFour) {
			imageFourName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageFourName,
					image: imageFour,
				})),
			);
		}
		if (imageFive) {
			imageFiveName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageFiveName,
					image: imageFive,
				})),
			);
		}
		if (imageSix) {
			imageSixName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageSixName,
					image: imageSix,
				})),
			);
		}

		const emailToken = RandomCodeUtility(10);
		const birthDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0).getTime();
		const todayDate = new Date().getTime();
		const difference = todayDate - birthDate;
		const age = Math.floor(difference / 1000 / 60 / 60 / 24 / 365.2);
		const userObject = new UserModel({
			firstName,
			lastName,
			email,
			gender,
			location: (location && coordinates)
				? {
					location,
					type: 'Point',
					coordinates: [coordinates[0], coordinates[1]],
				} : undefined,
			dob: {
				day,
				month,
				year,
			},
			interestedIn,
			ageRangeLow,
			ageRangeHigh,
			age,
			password: await HashUtility.generate({ text: password }),
			emailToken,
			fcmToken,
			device,
			about,
			jobTitle,
			favPlace,
			freeTimeActivity,
			pictureOne: imageOneName,
			pictureTwo: imageTwoName,
			pictureThree: imageThreeName,
			pictureFour: imageFourName,
			pictureFive: imageFiveName,
			pictureSix: imageSixName,
			emailTokenDate: new Date(),
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		// sending email to verify
		await EmailServices({ to: email, text: `Click the URL to verify ${HOST}user/verify?id=${userObject._id.toString()}&emailToken=${emailToken}`, subject: 'Please verify your email' });
		const userDetail = await userObject.save();

		// save user object and genration of token
		const { _id } = userDetail;
		const lookupQuery = { _id };
		const userDetails = await UserModel.findOne(lookupQuery);
		const token = await TokenUtility.generateToken({
			id: userDetail._id, email, role: 'user',
		});
		return resolve(ResponseUtility.SUCCESS({
			data: {
				accessToken: token,
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
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: err.message }));
	}
});
