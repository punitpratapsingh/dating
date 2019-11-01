/**
 * This schema represents the UserInterest schema
 * @author gurlal
 * @since 3 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const UserInterest = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	interestRef: { type: Schema.Types.ObjectId, required: true },
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('UserInterest', UserInterest);
