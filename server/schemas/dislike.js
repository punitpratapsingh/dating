/**
 * This schema represents the dislike schema
 * @author gurlal
 * @since 11 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Dislike = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	dislikedUser: { type: Schema.Types.ObjectId, required: true },
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Dislike', Dislike);
