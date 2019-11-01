/**
* This is the hideandseek constant file
* @author Santgurlal Singh
* @since 28 Sep, 2019
*/

export const {
	NODE_ENV = 'development',
	S3_BUCKET = '',
	// atlas configurations
	ATLAS_USER,
	ATLAS_PASSWORD,
	ADMIN_USER,
	ADMIN_PASSWORD,
	CLUSTER1,
	HOST,
	CLUSTER2,
	CLUSTER3,
	SHARD,
	SECRET_STRING,
	CONTACT_US_EMAIL,
	PAGINATION_LIMIT = 30,
	// RabbitMQ configuration
	RABBITMQ_HOST,
	RABBITMQ_USER,
	RABBITMQ_PASSWORD,
	ATLAS_CLUSTER,
	RABBITMQ_HEARTBEAT,
	INVITES_WITHOUT_SUB = 12,
	INVITES_WITH_SUB = 12,
	MATCHES_WITHOUT_SUB = 4,
	MATCHES_WITH_SUB = 4,
	INVITE_EXPIRE_TIME,
} = process.env;

const db = process.env.MONGO_DB || 'hideandseek-development';

/**
 * @description
 * This is constant file of hideandseek
 */

export const mongoConnectionString = `mongodb+srv://${ATLAS_USER}:${ATLAS_PASSWORD}@${ATLAS_CLUSTER}/${db}?retryWrites=true`;

// this string is unique for each project construction
export const secretString = SECRET_STRING;

export const AMQP_QUEUES = {
	IMAGE_UPLOAD: 'ImageUpload',
	PICTURE_DELETE: 'DeletePicture',
	GLOBAL_NOTIFICATION: 'PushAll',
};

export const GENDER = {
	MALE: 1,
	FEMALE: 2,
	OTHER: 3,
};

export const INVITE_ACTIONS = {
	PENDING: 1,
	ACCEPTED: 2,
	REJECTED: 3,
	SHECHDULED: 4,
	RESHECHDULED: 5,
	CONFIRMED: 6,
	COMPLETED: 7,
	CANCELLED: 8,
};

export const NOTIFICATION_TYPE = {
	INVITE_RECEIVED: 1,
	INVITE_ACCEPTED: 2,
	SCHEDULE_DATE: 3,
	RESCHEDULE_DATE: 4,
	CONFIRM_REQUEST: 5,
	MATCH: 6,
	GLOBAL: 7,

};

export const S3_IMAGES = {
	SMALL: `${S3_BUCKET}/${NODE_ENV}/images/small`,
	AVERAGE: `${S3_BUCKET}/${NODE_ENV}/images/average`,
	BEST: `${S3_BUCKET}/${NODE_ENV}/images/best`,
};

export const SOCIAL_IDENTIFIER = {
	FB: 1,
	LI: 2,
};

export const VERIFICATION_TYPE = {
	EMAIL_VERIFICATION: 1,
	CHANGE_PASSWORD: 2,
};

export const SUCCESS_CODE = 100;

export const MB = 1024 * 1024;
