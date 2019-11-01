import {
	InterestControllers,
	AuthenticationControllers,
} from '../controllers';
import { MultipartService } from '../services';

const prefix = '/api/interest/';
/**
 * @description
 * This is the route handler for the Interests
 * @author gurlal
 * @since 3 Oct, 2019
 */
export default (app) => {
	app.post(`${prefix}create`, MultipartService, InterestControllers.create);
	app.post(`${prefix}update`, MultipartService, InterestControllers.update);
	app.post(`${prefix}delete`, InterestControllers.delete);
	app.post(`${prefix}list`, InterestControllers.list);
	app.post(`${prefix}add`, AuthenticationControllers.authenticateUser, InterestControllers.add);
	app.post(`${prefix}remove`, AuthenticationControllers.authenticateUser, InterestControllers.remove);
};
