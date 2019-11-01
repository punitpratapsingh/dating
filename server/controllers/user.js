/*
* This is controller for user model
* @author gurlal
* @since 28 Sep, 2019
*/
import { UserModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, UserModel.UsersCreateService),
	verify: (req, res) => {
		const { query: { id, emailToken } } = req;
		UserModel.UsersVerifyService({ id, emailToken })
			.then(sucess => res.send(sucess))
			.catch(err => res.send(err));
	},
	changePassword: (req, res) => ModelResolver(req, res, UserModel.UsersChangePasswordService),
	resendVerification: (req, res) => ModelResolver(req, res, UserModel.UsersResendVerificationService),
	password: (req, res) => {
		const { query: { id, tok } } = req;
		UserModel.UsersPasswordService({ id, tok })
			.then((sucess) => {
				res.set('Content-Type', 'text/html');
				res.send(sucess.data);
			})
			.catch(err => res.send(err));
	},
	details: (req, res) => ModelResolver(req, res, UserModel.UsersDetailsService),
	update: (req, res) => ModelResolver(req, res, UserModel.UsersUpdateService),
	contactUs: (req, res) => ModelResolver(req, res, UserModel.UsersContactUsService),
	checkEmail: (req, res) => ModelResolver(req, res, UserModel.UsersCheckEmailService),
	listUsers: (req, res) => ModelResolver(req, res, UserModel.UsersListUsersService),
	listNotifications: (req, res) => ModelResolver(req, res, UserModel.UsersListNotificationsService),
	listDates: (req, res) => ModelResolver(req, res, UserModel.UsersListDatesService),
	likeUser: (req, res) => ModelResolver(req, res, UserModel.UsersLikeUserService),
	dislikeUser: (req, res) => ModelResolver(req, res, UserModel.UsersDislikeUserService),
	listLikes: (req, res) => ModelResolver(req, res, UserModel.UsersListLikesService),
	listDislikes: (req, res) => ModelResolver(req, res, UserModel.UsersListDislikesService),
	listMatches: (req, res) => ModelResolver(req, res, UserModel.UsersListMatchesService),
	rateUser: (req, res) => ModelResolver(req, res, UserModel.UsersRateUserService),
	socialLogin: (req, res) => ModelResolver(req, res, UserModel.UsersSocialLoginService),
	report: (req, res) => ModelResolver(req, res, UserModel.UserReportService),

};
