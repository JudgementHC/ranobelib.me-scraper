const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const Epub = require("epub-gen");
const prompt = require('prompt');



const arrTemp = []


prompt.start();
prompt.get(['first', 'last', 'vol', 'href'], function (err, result) {
	const firstChapter = result.first
	const lastChapter = result.last
	const ver = result.vol
	const url = result.href

	promiseLoop(url, firstChapter, lastChapter, ver)
})



promiseLoop = async (url, firstChapter, lastChapter, ver) => {
	/* url example https://ranobelib.me/otome-ga-world-is-a-tough-world-for-mob-novel */
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

					let domEl = $('.reader-container.container.container_center > p')

					if (domEl.length > 0) {
						domEl.each(function (index, el) {
							arrTemp.push(`<p>${$(el).text()}</p>`)
						});
					}
					resolve()
				}
			)
		})
		temp++
	}

	const option = {
		title: "World of otome game is tough for mobs",
		author: "",
		content: [
			{
				data: `${arrTemp.join(' ')}`
			}
		]
	};

	new Epub(option, `./World of otome game is tough for mobs(vol.${ver}, chap.${firstChapter}-${lastChapter}).epub`);
}