import {
	ResponseUtility,
	SchemaMapperUtility,
	RandomCodeUtility,
} from 'appknit-backend-bundle';
import InterestModel from '../../schemas/interest';
import { AMQP_QUEUES } from '../../constants';

/**
 * @description service model function to handle the updation
 * of Interest
 * @author gurlal
 * @since 3 Oct, 2019
 * @param {String} interestId
 * @param {String} interest
 */
export default ({
	interestId,
	interest,
	image,
	AMQPChannel,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!interestId) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Missing required property interestId.' }));
		}
		if (!(interest || image)) {
			return reject(ResponseUtility.MISSING_PROPS({ message: 'Please provide something to Update' }));
		}
		const matchQuery = { _id: interestId };
		const interestExists = await InterestModel.findOne({ _id: interestId });
		if (!interestExists) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'No interest Found.' }));
		}
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
		const updateQuery = await SchemaMapperUtility({
			interest,
			picture: imageName,
			updatedOn: new Date(),
		});
		await InterestModel.findOneAndUpdate(
			matchQuery,
			updateQuery,
			{ new: true },
		);
		return resolve(ResponseUtility.SUCCESS({
			message: 'interest Updated Successfully.',
		}));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error updating interest.', error: err }));
	}
});
