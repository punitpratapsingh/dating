import request from 'request';
import {
	ResponseUtility,
} from 'appknit-backend-bundle';

export default ({ accessToken }) => new Promise(async (resolve, reject) => {
	if (!accessToken) {
		return reject({ message: 'Missing required props accessToken.' });
	}
	request.get(`https://graph.facebook.com/me?access_token=${accessToken}`, (err, response, body) => {
		if (err) {
			return reject(err);
		}
		if (response.statusCode === 200) {
			const queryResponse = JSON.parse(response.body);
			return resolve(ResponseUtility.SUCCESS({ data: { ...queryResponse } }));
		}
		return reject({ message: 'Invalid Access Token' });
	});
});
