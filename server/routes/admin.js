/* eslint-disable import/named */
/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 23 October, 2019 12:12:46
*/

import {
	AdminControllers,
	AuthenticationControllers,
} from '../controllers';
import { MultipartService } from '../services';


const prefix = '/api/admin/';

export default (app) => {
	app.post(`${prefix}authenticate`, AdminControllers.authenticate);
	app.post(`${prefix}listUser`, AdminControllers.listUser);
	app.post(`${prefix}stats`, AdminControllers.stats);
	app.post(`${prefix}pushNotification`, AdminControllers.globalNotification);
	app.post(`${prefix}deleteUser`, AdminControllers.deleteUser);
	app.post(`${prefix}blockUser`, AdminControllers.blockUser);
	app.post(`${prefix}sendEmail`, AdminControllers.sendEmail);
	app.post(`${prefix}createFaq`, AdminControllers.createFaq);
	app.post(`${prefix}deleteFaq`, AdminControllers.deleteFaq);
	app.post(`${prefix}updateFaq`, AdminControllers.updateFaq);
	app.post(`${prefix}listFaq`, AdminControllers.listFaq);
	app.post(`${prefix}createInterest`, MultipartService, AdminControllers.createInterest);
	app.post(`${prefix}listInterest`, MultipartService, AdminControllers.listInterest);
	app.post(`${prefix}deleteInterest`, AdminControllers.deleteInterest);
	app.post(`${prefix}listMatches`, AdminControllers.listMatches);
	app.post(`${prefix}reportedUser`, AdminControllers.reportedUser);


};
