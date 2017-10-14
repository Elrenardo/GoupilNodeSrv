'use strict';
/*
===================================================================
* File name   : copier un fichier.js
* Author      : Teysseire Guillaume
* Create At   : 12/10/2017
* Update At   : 
* Description : copie un fichier
===================================================================
*/

//dépendence gestion fichier
let fs = require('fs');

module.exports = function( filename_input, filename,output )
{
	return new Promise(function( resolve, reject)
	{
		fs.createReadStream( filename_input )
		.pipe( fs.createWriteStream( filename,output )
			.on("close", function(ex)
			{
				resolve();
			})
			.on("error", function(err)
			{
	    		reject(err);
	  		})
  		)
  		.on("error", function(err) {
		    reject(err);
		});
	});
}