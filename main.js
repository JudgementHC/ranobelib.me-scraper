/* 89 - 122 */

/* DEPENDENCIES */
const Epub = require("epub-gen")
const prompt = require('prompt')
const fs = require('fs')

/* LOCAL FILE IMPORT */
const { sendRanobe, getRanobe, checkRequest } = require('./executableJS/convertFb2')
const scrapRanobeText = require("./executableJS/scrapRanobeText")



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
		},
		convertToFb2: {
			description: 'Do you need to convert epub to fb2? yes/no'
		},
		convertApiKey: {
			description: 'Input api key from https://developers.zamzar.com/user',
			ask: () => {
				const historyValue = prompt.history('convertToFb2').value
				return historyValue === 'yes' || historyValue === 'y'
			},
			required: true,
			message: 'Required parameter'
		}
	}
}

prompt.start()

prompt.get(ranobeSchema, async function (err, result) {
	let [firstChapter, lastChapter, ver, url, titleName] = 
	[result.first, result.last, result.vol, result.href, result.name].map(el => el.trim())

	let options = await scrapRanobeText(url, firstChapter, lastChapter, ver)

	const option = {
		title: titleName,
		author: "",
		content: options
	}

	checkFolder('./ranobe', async () => {
		const titleDir = `./ranobe/${titleName}(vol.${ver}, chap.${firstChapter}-${lastChapter})`
	
		const epub = await new Epub(option, `${titleDir}.epub`).promise

		if (result.convertApiKey.length > 0) {
			// const apiKey = 'f836cd51aacaa3ddc97156339f8381e6cca888be'
			const formData = {
				target_format: 'fb2',
				source_file: fs.createReadStream(`${titleDir}.epub`)
			}

			const API = result.convertApiKey
			const jobID = await sendRanobe(formData, API)

			const serverResponse = await checkRequest(jobID, API)

			if (serverResponse) {
				getRanobe(serverResponse, `${titleDir}.fb2`, API)
			}
		}
		else {
			console.error(epub)
		}
	})
})


function checkFolder(folderName, callback) {
	if (!fs.existsSync(folderName)) {
		fs.mkdirSync(folderName)
	}

	callback()
}