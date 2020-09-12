const request = require('request')
const fs = require('fs')


/* const apiKey = 'f836cd51aacaa3ddc97156339f8381e6cca888be'
const formData = {
	target_format: 'fb2',
	source_file: fs.createReadStream('./ranobe/World of otome game is tough for mobs(vol.4, chap.123-165).epub')
} */
const sendRanobe = (formData, apiKey) => {
	return new Promise(resolve => {
		request.post(
			{
				url: 'https://sandbox.zamzar.com/v1/jobs/',
				formData,
			},
			function (err, response, body) {
				if (err) {
					reject(err)
				} else {
					resolve(JSON.parse(body).id)
				}
			}
		).auth(apiKey, '', true)
	})
}


/* var request = require('request'),
	apiKey = 'f836cd51aacaa3ddc97156339f8381e6cca888be',
	jobID = 15 */

const checkRequest = async (jobID, apiKey) => {
	return new Promise(resolve => {
		let interval = setInterval(() => {
			request.get(
				`https://sandbox.zamzar.com/v1/jobs/${jobID}`,
				function (err, response, body) {
					if (err) {
						reject(err)
					} else {
						let { status, target_files } = JSON.parse(body)
						
						if (status == 'successful') {
							clearInterval(interval)
							resolve(target_files[0]['id'])
						}
						else {
							console.info(status)
						}
					}
				}
			).auth(apiKey, '', true)
		}, 10000)
	})
}


const getRanobe = async (fileID, fileName, apiKey) => {
	return new Promise(resolve => {
		request.get(
			{
				url: 'https://sandbox.zamzar.com/v1/files/' + fileID + '/content',
				followRedirect: false
			},
			function (err, response, body) {
				if (err) {
					reject(err)
				} else {
					// We are being redirected
					if (response.headers.location) {
						// Issue a second request to download the file
						var fileRequest = request(response.headers.location)
						fileRequest.on('response', function (res) {
							res.pipe(fs.createWriteStream(fileName))
						})
						fileRequest.on('end', function () {
							resolve('File download complete')
						})
					}
				}
			}
		).auth(apiKey, '', true).pipe(fs.createWriteStream(fileName))
	})
}



module.exports = { sendRanobe, getRanobe, checkRequest }