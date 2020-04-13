const request = require('request');
const cheerio = require('cheerio');
async function scrapRanobeText(url, firstChapter, lastChapter, ver) {
	let tempChapter = firstChapter;
	const optionTemp = [];
	while (tempChapter <= lastChapter) {
		await new Promise(resolve => {
			request(`${url}/v${ver}/c${tempChapter}`, function (error, response, body) {
				if (error) {
					throw error;
				}
				let $ = cheerio.load(body);
				let arrTemp = [];
				let domEl = $('.reader-container.container.container_center > p');
				let domTitle = $('span.text-truncate').text();
				if (domEl.length > 0) {
					domEl.each(function (index, el) {
						arrTemp.push(`<p>${$(el).text()}</p>`);
					});
				}
				optionTemp.push({ title: domTitle, data: arrTemp.join(' ') });
				resolve();
			});
		});
		tempChapter++;
	}
	return optionTemp;
}
exports.scrapRanobeText = scrapRanobeText;
