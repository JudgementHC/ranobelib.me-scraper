const request = require('request')
const fs = require('fs')


/* const apiKey = 'f836cd51aacaa3ddc97156339f8381e6cca888be'
const formData = {
	target_format: 'fb2',
	source_file: fs.createReadStream('./ranobe/World of otome game is tough for mobs(vol.4, chap.123-165).epub')
}; */
const sendRanobe = async (formData, apiKey) => {
	let dataID = ''
	
	await new Promise(resolve => {
		request.post({
				url: 'https://sandbox.zamzar.com/v1/jobs/',
				formData,
			},
			function (err, response, body) {
				if (err) {
					console.error('Unable to start conversion job', err);
				} else {
					dataID = JSON.parse(body).id
					console.log('SUCCESS! Conversion job started:', dataID);
				}
			}
		).auth(apiKey, '', true);

		resolve();
	})

	return dataID;
}


/* var request = require('request'),
	apiKey = 'f836cd51aacaa3ddc97156339f8381e6cca888be',
	jobID = 15; */

const checkRequest = async (jobID, apiKey) => {
	let serverAnswer = ''
	
	await new Promise(resolve => {
		request.get(
			`https://sandbox.zamzar.com/v1/jobs/${jobID}`,
			function (err, response, body) {
				if (err) {
					console.error('Unable to get job', err);
				} else {
					serverAnswer = JSON.parse(body).status
					console.log('SUCCESS! Got job:', serverAnswer);
				}
			}
		).auth(apiKey, '', true);

		resolve();
	})

	return serverAnswer;
}


const getRanobe = async (fileID, fileName, apiKey) => {
	await new Promise(resolve => {
		request.get({
				url: 'https://sandbox.zamzar.com/v1/files/' + fileID + '/content',
				followRedirect: false
			},
			function (err, response, body) {
				if (err) {
					console.error('Unable to download file:', err);
				} else {
					// We are being redirected
					if (response.headers.location) {
						// Issue a second request to download the file
						var fileRequest = request(response.headers.location);
						fileRequest.on('response', function (res) {
							res.pipe(fs.createWriteStream(fileName));
						});
						fileRequest.on('end', function () {
							console.log('File download complete');
						});
					}
				}
			}
		).auth(apiKey, '', true).pipe(fs.createWriteStream(fileName));

		resolve();
	})
}



exports.convertFb2 = { sendRanobe, getRanobe, checkRequest };