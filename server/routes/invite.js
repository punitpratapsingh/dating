import {
	InviteControllers,
	AuthenticationControllers,
} from '../controllers';

const prefix = '/api/invite/';
/**
 * @description
 * This is the route handler for the Invites
 * @author gurlal
 * @since 4 Oct, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, AuthenticationControllers.authenticateUser, InviteControllers.create);
	app.post(`${prefix}list`, AuthenticationControllers.authenticateUser, InviteControllers.list);
	app.post(`${prefix}action`, AuthenticationControllers.authenticateUser, InviteControllers.action);
	app.post(`${prefix}schedule`, AuthenticationControllers.authenticateUser, InviteControllers.schedule);
	app.post(`${prefix}reschedule`, AuthenticationControllers.authenticateUser, InviteControllers.reschedule);
	app.post(`${prefix}confirm`, AuthenticationControllers.authenticateUser, InviteControllers.confirm);
};
