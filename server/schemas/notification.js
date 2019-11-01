/**
 * This schema represents the notifications schema
 * @author SantGurlal Singh
 * @since 8 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import { NOTIFICATION_TYPE } from '../constants';

const Notification = new Schema({
	ref: { type: Schema.Types.ObjectId, required: true },
	// reference to invite or req.
	type: {
		type: Number,
		required: true,
		min: NOTIFICATION_TYPE.INVITE_RECEIVED,
		max: NOTIFICATION_TYPE.CONFIRM_REQUEST,
	},	// @see constants.js for valid types
	text: { type: String, required: true },	// the normal text
	boldText: { type: String, default: '' },	// the highlighted text
	timestamp: Number,	// the date timestamp
	date: { type: Date, required: true },	// the moment.js format timestamp
	userRef: { type: Schema.Types.ObjectId },
	notificationFor: { type: Schema.Types.ObjectId }, // the user who will see this notification
});
export default database.model('Notification', Notification);
