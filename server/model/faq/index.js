/**
 * @description Write the Service Model function description here.
 * @author punit
 * @since 24 October, 2019 10:05:43
*/
import fs from 'fs';

const skip = ['index.js'];
const files = fs.readdirSync(__dirname);

files.map((file) => {
	const found = skip.find(skipThisFile => skipThisFile === file);
	if (!found) {
		const fileName = `${file.charAt(0).toUpperCase()}${file.split('.')[0].substring(1, file.length)}`;
		if (!fileName.startsWith('.')) {
			module.exports[`Faqs${fileName}Service`] = require(`./${file}`).default;
		}
	}
});


