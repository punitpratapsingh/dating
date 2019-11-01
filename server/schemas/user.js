/**
 * This schema represents the users profile schema
 * @author gurlal
 * @since 28 sep, 2019
 */
import { Schema } from 'mongoose';
import database from '../db';
import { GENDER } from '../constants';

const User = new Schema({
	firstName: String,
	lastName: String,
	email: String,
	about: String,
	jobTitle: String,
	favPlace: String,
	freeTimeActivity: String,
	password: { type: String, required: true },
	gender: {
		type: Number, min: GENDER.MALE, max: GENDER.OTHER, required: true,
	},
	location: {
		location: { type: String, default: '' },
		type: { type: String, default: 'Point' },
		coordinates: [Number, Number],
	},
	dob: {
		day: Number,
		month: Number,
		year: Number,
	},
	interestedIn: {
		type: Number, min: GENDER.MALE, max: GENDER.OTHER, required: true,
	},
	ageRangeLow: { type: Number, required: true },
	ageRangeHigh: { type: Number, required: true },
	age: Number,
	socialId: String,
	socialToken: String,
	socialIdentifier: String,
	pictureOne: String,
	pictureTwo: String,
	pictureThree: String,
	pictureFour: String,
	pictureFive: String,
	pictureSix: String,
	emailToken: { type: Number },
	emailTokenDate: Date,
	invitesRefreshTime: Number,
	isVerified: { type: Boolean, default: false },
	blocked: { type: Boolean, default: false },
	deleted: { type: Boolean, default: false },
	fcmToken: String,
	device: String,
	createdOn: Number,
	updatedOn: Number,
	changePassToken: String,
	changePassTokenDate: Date,
});
User.index({ location: '2dsphere' });
export default database.model('User', User);
