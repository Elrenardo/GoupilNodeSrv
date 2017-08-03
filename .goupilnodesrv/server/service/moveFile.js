'use strict';
/*
===================================================================
* File name   : moveFile.js
* Author      : Teysseire Guillaume
* Create At   : 08/02/2016
* Update At   : 
* Description : deplace un fichier d'un répertoire a un autre
===================================================================
*/
const fs = require('fs');

module.exports = function( tmp_path, target_path )
{
	return new Promise( function(resolve, reject )
	{
		/** A better way to copy the uploaded file. **/
		var src  = fs.createReadStream(tmp_path);
		var dest = fs.createWriteStream(target_path);
		
		src.pipe(dest);
		src.on('end', function(){ 
			//fs.unlink(tmp_path); //BUG double suppression à la fin du ctrl
			resolve(target_path); 
		});
		src.on('error', function(err) { 
			reject(target_path); 
		});
	});
};