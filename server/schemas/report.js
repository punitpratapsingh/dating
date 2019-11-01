import { Schema } from 'mongoose';
import database from '../db';
import { REPORT } from '../constants';

/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 25 October, 2019 14:29:46
*/


const Report = new Schema({
	ref: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // refrence to user that will be reported
	by: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // reported by this user
	reason: [{ type: String, min: 1, max: 4 }],
	comment: { type: String },
	for: { type: String },
});

export default database.model('Report', Report);



