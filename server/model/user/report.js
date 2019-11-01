import {
	ResponseUtility,
} from 'appknit-backend-bundle';

import { ReportModel, UserModel } from '../../schemas';
import { REPORT } from '../../constants';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 25 October, 2019 14:29:46
*/

export default ({
	id, // who is reporting
	to, // id to send report for
	comment,
	reason,
	reportType,
}) => new Promise(async (resolve, reject) => {
	try {
		if (!id) {
			return reject(ResponseUtility.GENERIC_ERR({ message: 'The id is must required' }));
		}

		const reportObject = new ReportModel({
			by: id,
			ref: to, // report to this user
			comment,
			reason,
			for: reportType,
		});
		const report = await reportObject.save();
		resolve(ResponseUtility.SUCCESS({ data: { ...report._doc } }));
	} catch (err) {
		return reject(ResponseUtility.GENERIC_ERR({ message: 'There was some error.', error: err.message }));
	}
});
