import {
	ResponseUtility,
	SchemaMapperUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import UserModel from '../../schemas/user';
import { AMQP_QUEUES } from '../../constants';

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
	id,
	firstName,
	lastName,
	gender,
	location,
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
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		const user = await UserModel.findOne({ _id: id });
		if (!user) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No user found.' }));
		}
		let imageOneName;
		let imageTwoName;
		let imageThreeName;
		let imageFourName;
		let imageFiveName;
		let imageSixName;
		if (imageOne) {
			if (user.pictureOne) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: user.pictureOne,
					})),
				);
			}
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
			if (user.pictureTwo) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: user.pictureTwo,
					})),
				);
			}
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
			if (user.pictureThree) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: user.pictureThree,
					})),
				);
			}
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
			if (user.pictureFour) {
				AMQPChannel.sendToQueue(
					AMQP_QUEUES.PICTURE_DELETE,
					Buffer.from(JSON.stringify({
						name: user.pictureFour,
					})),
				);
			}
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
		const updateQuery = await SchemaMapperUtility({
			firstName,
			lastName,
			gender,
			location,
			'dob.day': day,
			'dob.month': month,
			'dob.year': year,
			interestedIn,
			ageRangeLow,
			ageRangeHigh,
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
			updatedOn: new Date(),
		});
		if (day || month || year) {
			if (!day) {
				day = user.dob.day;
			}
			if (!month) {
				month = user.dob.month;
			}
			if (!year) {
				year = user.dob.year;
			}
			const birthDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0).getTime();
			const todayDate = new Date().getTime();
			const difference = todayDate - birthDate;
			const age = Math.floor(difference / 1000 / 60 / 60 / 24 / 365.2);
			updateQuery.age = age;
		}
		await UserModel.findOneAndUpdate(
			{ _id: id },
			updateQuery,
			{ new: true },
		);
		return resolve(ResponseUtility.SUCCESS({ message: 'Your profile has been updated.' }));
	} catch (err) {
		console.log(err);
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: err }));
	}
});
