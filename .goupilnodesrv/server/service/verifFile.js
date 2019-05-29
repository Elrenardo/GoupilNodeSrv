'use strict';
/*
===================================================================
* File name   : verifFile.js
* Author      : Teysseire Guillaume
* Create At   : 12/08/2016
* Update At   : 
* Description : vérifie si un fichier ou dossier existe
===================================================================
*/

//dépendence gestion fichier
let fs = require('graceful-fs');//require('fs');

module.exports = function( filename )
{
	return new Promise(function( resolve, reject )
	{
		//vérfier l'existence du dossier ou ficier
		fs.exists(filename, function(exists)
		{
			//si existe pas
		    if(!exists)
		    	return reject(404);

		    //ok exist !
		    resolve( filename );
		});
	});
}