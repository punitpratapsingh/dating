import {
	AuthenticationControllers,
	UserControllers,
} from '../controllers';
import { MultipartService } from '../services';

const prefix = '/api/user/';
/**
 * @description
 * This is the route handler for the user
 * @author gurlal
 * @since 28 Sep, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, MultipartService, UserControllers.create);
	app.post(`${prefix}update`, MultipartService, AuthenticationControllers.authenticateUser, UserControllers.update);
	app.post(`${prefix}listNotifications`, AuthenticationControllers.authenticateUser, UserControllers.listNotifications);
	app.post(`${prefix}listDates`, AuthenticationControllers.authenticateUser, UserControllers.listDates);
	app.get(`${prefix}verify`, UserControllers.verify);
	app.post(`${prefix}details`, AuthenticationControllers.authenticateUser, UserControllers.details);
	app.post(`${prefix}listUsers`, AuthenticationControllers.authenticateUser, UserControllers.listUsers);
	app.post(`${prefix}changePassword`, UserControllers.changePassword);
	app.get(`${prefix}changePassword`, UserControllers.password);
	app.post(`${prefix}resendVerification`, UserControllers.resendVerification);
	app.post(`${prefix}contactUs`, UserControllers.contactUs);
	app.post(`${prefix}checkEmail`, UserControllers.checkEmail);
	app.post(`${prefix}likeUser`, AuthenticationControllers.authenticateUser, UserControllers.likeUser);
	app.post(`${prefix}dislikeUser`, AuthenticationControllers.authenticateUser, UserControllers.dislikeUser);
	app.post(`${prefix}listLikes`, AuthenticationControllers.authenticateUser, UserControllers.listLikes);
	app.post(`${prefix}listDislikes`, AuthenticationControllers.authenticateUser, UserControllers.listDislikes);
	app.post(`${prefix}listMatches`, AuthenticationControllers.authenticateUser, UserControllers.listMatches);
	app.post(`${prefix}rateUser`, AuthenticationControllers.authenticateUser, UserControllers.rateUser);
	app.post(`${prefix}socialLogin`, UserControllers.socialLogin);
	app.post(`${prefix}report`, AuthenticationControllers.authenticateUser, UserControllers.report);

};
