/* eslint-disable import/named */
/**
 * @description controllers  for admin
 * @author punit
 * @since 2 August 2019
 */
import {
	ResponseUtility,
	TokenUtility,
} from 'appknit-backend-bundle';
import {
	ADMIN_PASSWORD, ADMIN_USER, AMQP_QUEUES,
} from '../constants';
import {
	UserModel, FaqModel, InterestModel,
} from '../model';
import UserSchemaModel from '../schemas/user';
import { ModelResolver } from './resolvers';

export default {
	authenticate: (req, res) => {
		const { body: { user, password } } = req;
	
		if (user && password) {
			if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
				return res.send({ code: 100, message: 'Success', accessToken: TokenUtility.generateToken({ role: 'admin' }) });
			}
			return res.send(ResponseUtility.LOGIN_AUTH_FAILED());
		}
		return res.send(ResponseUtility.MISSING_PROPS({ message: 'Missing username or password.' }));
	},
	stats: (req, res) => ModelResolver(req, res, () => new Promise(async (resolve, reject) => {
		// user stats
		const activeUsers = await UserSchemaModel.countDocuments({ deleted: false });
		const deletedUsers = await UserSchemaModel.countDocuments({ deleted: true });
		const blocked = await UserSchemaModel.countDocuments({ blocked: true, deleted: false });
		// Users stats
		return resolve(ResponseUtility.SUCCESS({
			data: {
				users: {
					active: activeUsers,
					deleted: deletedUsers,
					blocked,
				},
			},
		}));
	})),
	globalNotification: (req, res) => {
		const {
			body: {
				title,
				AMQPChannel,
			},
		} = req;
		if (!title) {
			return res.send(ResponseUtility.MISSING_PROPS({ message: 'Missing required property title.' }));
		}
		try {
			AMQPChannel.sendToQueue(
				AMQP_QUEUES.GLOBAL_NOTIFICATION,
				Buffer.from(
					JSON.stringify({
						title,
					}),
				),
			);
		} catch (err) {
			console.log(err);
		}
		res.send(ResponseUtility.SUCCESS());
	},
	listUser: (req, res) => ModelResolver(req, res, UserModel.UsersListAllService),
	blockUser: (req, res) => ModelResolver(req, res, UserModel.UsersBlockService),
	deleteUser: (req, res) => ModelResolver(req, res, UserModel.UsersDeleteService),
	sendEmail: (req, res) => ModelResolver(req, res, UserModel.UsersEmailService),
	createFaq: (req, res) => ModelResolver(req, res, FaqModel.FaqsCreateService),
	deleteFaq: (req, res) => ModelResolver(req, res, FaqModel.FaqsDeleteService),
	updateFaq: (req, res) => ModelResolver(req, res, FaqModel.FaqsUpdateService),
	listFaq: (req, res) => ModelResolver(req, res, FaqModel.FaqsListService),
	createInterest: (req, res) => ModelResolver(req, res, InterestModel.InterestCreateService),
	deleteInterest: (req, res) => ModelResolver(req, res, InterestModel.InterestDeleteService),
	listInterest: (req, res) => ModelResolver(req, res, InterestModel.InterestListService),
	listMatches: (req, res) => ModelResolver(req, res, UserModel.UsersMatchesService),
	reportedUser: (req, res) => ModelResolver(req, res, UserModel.UserReportedUserService),



};
