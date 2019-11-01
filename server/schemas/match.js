/**
 * This schema represents the match schema
 * @author gurlal
 * @since 15 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Match = new Schema({
	toUser: { type: Schema.Types.ObjectId, required: true }, // who accepted the invite
	fromUser: { type: Schema.Types.ObjectId, required: true }, // who sent the invite
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Match', Match);
