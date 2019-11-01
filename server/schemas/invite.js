/**
 * This schema represents the invitation schema
 * @author gurlal
 * @since 29 sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Invite = new Schema({
	toUser: { type: Schema.Types.ObjectId, required: true },
	fromUser: { type: Schema.Types.ObjectId, required: true },
	status: { type: Number, default: 1 },
	text: String,
	date: {
		day: String,
		month: String,
		year: String,
	},
	time: {
		hour: Number,
		minute: Number,
	},
	reDate: {
		day: String,
		month: String,
		year: String,
	},
	reTime: {
		hour: Number,
		minute: Number,
	},
	location: {
		location: { type: String, default: '' },
		type: { type: String, default: 'Point' },
		coordinates: [Number, Number],
	},
	reLocation: {
		location: { type: String, default: '' },
		type: { type: String, default: 'Point' },
		coordinates: [Number, Number],
	},
	note: String,
	reNote: String,
	splitBill: Number,
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Invite', Invite);
