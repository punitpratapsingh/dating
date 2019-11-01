
/*
* This is controller for invite model
* @author gurlal
* @since 4 Oct, 2019
*/
import { InviteModel } from '../model';
import { ModelResolver } from './resolvers';

export default {
	create: (req, res) => ModelResolver(req, res, InviteModel.InviteCreateService),
	list: (req, res) => ModelResolver(req, res, InviteModel.InviteListService),
	action: (req, res) => ModelResolver(req, res, InviteModel.InviteActionService),
	schedule: (req, res) => ModelResolver(req, res, InviteModel.InviteScheduleService),
	reschedule: (req, res) => ModelResolver(req, res, InviteModel.InviteRescheduleService),
	confirm: (req, res) => ModelResolver(req, res, InviteModel.InviteConfirmService),
};
