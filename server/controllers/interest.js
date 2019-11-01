
/*
* This is controller for interest model
* @author gurlal
* @since 3 Oct, 2019
*/
import { InterestModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, InterestModel.InterestCreateService),
	update: (req, res) => ModelResolver(req, res, InterestModel.InterestUpdateService),
	delete: (req, res) => ModelResolver(req, res, InterestModel.InterestDeleteService),
	list: (req, res) => ModelResolver(req, res, InterestModel.InterestListService),
	add: (req, res) => ModelResolver(req, res, InterestModel.InterestAddService),
	remove: (req, res) => ModelResolver(req, res, InterestModel.InterestRemoveService),
};
