/**
 * This schema represents the rating schema
 * @author gurlal
 * @since 12 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Rating = new Schema({
	userRef: { type: Schema.Types.ObjectId, required: true }, // user who is submitted rating
	ratedUser: { type: Schema.Types.ObjectId, required: true }, // user who is rated
	inviteRef: { type: Schema.Types.ObjectId, required: true },
	rating: Number,
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Rating', Rating);
