/**
 * This schema represents the interest schema
 * @author gurlal
 * @since 3 Oct, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';

const Interest = new Schema({
	interest: String,
	picture: String,
	createdOn: Number,
	updatedOn: Number,
});

export default database.model('Interest', Interest);
