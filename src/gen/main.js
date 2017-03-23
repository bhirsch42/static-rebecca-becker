'use strict'

module.exports.generate = function(event, context, callback) {
	const AWS = require('aws-sdk');
	const secrets = require('./config')
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

	let s3urlProd = 'http://s3.amazonaws.com';
	let s3urlDev = 'http://localhost:4569';
	let s3url;
	if (process.env.NODE_ENV == 'production') {
		s3url = s3urlProd;
	} else {
		s3url = s3urlDev;
	}

	let awsConfig = {
		s3ForcePathStyle: true,
		accessKeyId: secrets.accessKeyId,
		secretAccessKey: secrets.secretAccessKey,
		endpoint: new AWS.Endpoint(s3url)
	}

	let s3 = new AWS.S3(awsConfig);

	let templates = {}

	templates.home = require('../site/templates/home.hbs');

	let generateFile = (filename, body) => {	
		let s3params = {
			Key: filename,
			Bucket: 'rebecca-becker',
			ContentType: 'text/html',
			Body: body
		};

		s3.putObject(s3params, (err, data) => {
			console.log('s3 uploads', err, data);
		});
	}

	// CONTENTFUL SETUP

	var contentful = require('contentful')

	var client = contentful.createClient({
	  space: secrets.contentful_space_id,
	  accessToken: secrets.contentful_access_token
	})

	client.getEntries()
	  .then((response) => {
	    let homePageItem = response.items.find(item => item.sys.contentType.sys.id == 'homePage')
	    let homePageData = homePageItem.fields
			let renderedHTML = templates.home(homePageData);
			generateFile('index.html', renderedHTML)
			console.log(renderedHTML)
	  })
	  .catch((error) => {
	    console.log('\x1b[31merror occured')
	    console.log(error)
	  })
}