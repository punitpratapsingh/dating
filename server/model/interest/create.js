import {
	ResponseUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import InterestModel from '../../schemas/interest';
import { AMQP_QUEUES } from '../../constants';

/**
 * @description service model function to handle the creation
 * of Interest
 * @author gurlal
 * @since 3 Oct, 2019
 * @param {String} interest
*/
export default ({
	interest,
	image,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		console.log(image);
		console.log(interest);
		if (!interest) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property' }));
		}
		console.log(image);
		let imageName;
		if (image) {
			imageName = `${Date.now() * RandomCodeUtility(3)}`;
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.IMAGE_UPLOAD,
				Buffer.from(JSON.stringify({
					name: imageName,
					image: { data: image },
				})),
			);
		}
		const InterestObject = new InterestModel({
			interest,
			picture: imageName,
			createdOn: new Date(),
			updatedOn: new Date(),
		});
		await InterestObject.save();
		return resolve(ResponseUtility.SUCCESS({ message: 'Interest Created Successfully.' }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error creating Interest.', error: `${err}` }));
	}
});
