/* Imports */
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const bp = require('body-parser');
const https = require('https');
const http = require('http');

/* 	SSL Trusted CA Certification

	Enables secure connection over internet.	
	Needs a certificate.crl, ca_bundle.crt and private.key to work.
*/
/* const https_options = {
	cert: fs.readFileSync("./certificate.crt"),
	ca: fs.readFileSync("./ca_bundle.crt"),
	key: fs.readFileSync("./private.key"),
} */

const PORT = process.env.PORT || 3001;
const app = express();
app.use(bp.urlencoded({extended: true}));
app.use(bp.json());
app.use(cors());

/* Google API

	Uses Google Sheets as database.
	Needs a key.json to work.
	Read more on Google console documentation.
*/
const { GoogleSpreadsheet } = require("google-spreadsheet");
const SHEET_ID = '' // You must add the sheets id inside ''
const doc = new GoogleSpreadsheet(SHEET_ID);
const credentials = JSON.parse(fs.readFileSync('./key.json'));

/* If SSL is not provided, HTTP run instead */
if (https_options){
	const httpServer = https.createServer(https_options, app);
	httpServer.listen(PORT)
} else {
	const httpServer = http.createServer(app);
	httpServer.listen(PORT)
}

/* Routing */
app.get('/', (req, res) => {
	res.send("Working")
})

app.get("/client", async (req, res) => {
	/* Use service account credentials */
	await doc.useServiceAccountAuth({
		client_email: credentials.client_email,
		private_key: credentials.private_key
	})

	/* Load the document info */
	await doc.loadInfo();

	/* Load sheet from document */
	let sheet = doc.sheetsByIndex[0]
	
	let rows = await sheet.getRows();

	for (let index = 0; index < rows.length; index++){
		const row = rows[index];

		res.send(row.name)
	}
})

app.post("/send", async (req, res) => {
	const data = [];
	const { name, email, phone } = req.body;
	data.push({name, email, phone});
	
	/* Use service account credentials */
	await doc.useServiceAccountAuth({
		client_email: credentials.client_email,
		private_key: credentials.private_key
	})

	/* Load document */
	await doc.loadInfo();

	/* Load sheet from document */
	let sheet = doc.sheetsByIndex[0];

	console.log(req.body)
	
	for (index = 0; index < data.length; index++){
		const row = data[index];
		await sheet.addRow(row);
	}
	}
)