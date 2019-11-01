/*
 * Description for the schema
 * @author punit
 * @since 23 October, 2019 16:41:00
*/
import { Schema } from 'mongoose';
import database from '../db';

const Question = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

export default database.model('Question', Question);
