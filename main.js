/* DEPENDENCIES */
const Epub = require("epub-gen");
const prompt = require('prompt');

/* LOCAL FILE IMPORT */
const { convertFb2 } = require('./executableJS/convertFb2')
const { scrapRanobeText } = require("./executableJS/scrapRanobeText");



const ranobeSchema = {
	properties: {
		first: {
			description: 'The initial chapter (example: 60)',
			message: 'Required parameter',
			required: true
		},
		last: {
			description: 'The last chapter (example: 120)',
			message: 'Required parameter',
			required: true
		},
		vol: {
			description: 'Ranobe volume (example: 5)',
			message: 'Required parameter',
			required: true
		},
		href: {
			description: 'Link to a ranobe.\n URL example: https://ranobelib.me/otome-ga-world-is-a-tough-world-for-mob-novel',
			message: 'Required parameter',
			required: true
		},
		name: {
			description: 'Name of title',
			message: 'Required parameter',
			required: true
		}
	}
};
prompt.start();
prompt.get(ranobeSchema, async function (err, result) {
	let [firstChapter, lastChapter, ver, url, titleName] = 
	[result.first, result.last, result.vol, result.href, result.name].map(el => el.trim())

	let options = await scrapRanobeText(url, firstChapter, lastChapter, ver)

	const option = {
		title: titleName,
		author: "",
		content: options
	};

	new Epub(option, `./ranobe/${titleName}(vol.${ver}, chap.${firstChapter}-${lastChapter}).epub`);
});