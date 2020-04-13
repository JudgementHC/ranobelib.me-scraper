const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Epub = require("epub-gen");
const prompt = require('prompt');


/* global variable */
const optionTemp = []
let titleName = ''


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
		},
		name: {
			description: 'Name of title',
			message: 'Required parameter',
			required: true
		}
	}
};

prompt.start();
prompt.get(ranobeSchema, function (err, result) {
	let [firstChapter, lastChapter, ver, url, titleName] = 
	[result.first, result.last, result.vol, result.href, result.name].map(el => el.trim())

	promiseLoop(url, firstChapter, lastChapter, ver, titleName)
})



promiseLoop = async (url, firstChapter, lastChapter, ver, titleName) => {
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

					optionTemp.push({title: domTitle, data: arrTemp.join(' ')})
					
					resolve()
				}
			)
		})
		temp++
	}


	const option = {
		title: titleName,
		author: "",
		content: optionTemp
	};
	
	new Epub(option, `./ranobe/${titleName}(vol.${ver}, chap.${firstChapter}-${lastChapter}).epub`);
}