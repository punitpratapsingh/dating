/**
 * This schema represents the like schema
 * @author gurlal
 * @since 11 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Like = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true },
	likedUser: { type: Schema.Types.ObjectId, required: true },
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Like', Like);
