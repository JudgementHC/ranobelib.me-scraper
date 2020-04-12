const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Epub = require("epub-gen");
const prompt = require('prompt');




const option = {
	title: "The world of otome game is tough for mobs",
	author: "",
	content: []
};


var ranobeSchema = {
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
		}
	}
};

prompt.start();
prompt.get(ranobeSchema, function (err, result) {
	const firstChapter = result.first
	const lastChapter = result.last
	const ver = result.vol
	const url = result.href

	promiseLoop(url, firstChapter, lastChapter, ver)
})



promiseLoop = async (url, firstChapter, lastChapter, ver) => {
	let temp = firstChapter
	
	while (temp <= lastChapter) {
		await new Promise(resolve => {
			request(
				`${url}/v${ver}/c${temp}`,
				function (error, response, body) {
					if (error) {
						throw error
					}

					let $ = cheerio.load(body);
					let arrTemp = []

					let domEl = $('.reader-container.container.container_center > p')
					let domTitle = $('span.text-truncate').text()


					if (domEl.length > 0) {
						domEl.each(function (index, el) {
							arrTemp.push(`<p>${$(el).text()}</p>`)
						});
					}

					option.content.push({title: domTitle, data: arrTemp.join(' ')})
					
					resolve()
				}
			)
		})
		temp++
	}


	new Epub(option, `./World of otome game is tough for mobs(vol.${ver}, chap.${firstChapter}-${lastChapter}).epub`);
}