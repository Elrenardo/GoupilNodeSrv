'use strict';
/*
===================================================================
* File name   : copyDir.js
* Author      : Teysseire Guillaume
* Create At   : 12/08/2017
* Update At   : 
* Description : copie un répertoire récursivement tout en exécutant une fonction de modification sur chaque fichier
===================================================================
*/
const fs             = require('fs');
const mkdirp         = require('mkdirp');
const dirRec         = require( global.dirname+'server/service/dirRec');
const getExtFile     = require( global.dirname+'server/service/getExtFile');
const pathSepDirFile = require( global.dirname+'server/service/pathSepDirFile');
const relativeURL    = require( global.dirname+'server/service/relativeURL');
const isBinaryPath   = require('is-binary-path');


module.exports = function( dir_input, dir_output, callback )
{
	dir_input = relativeURL( dir_input );
	dir_output = relativeURL( dir_output );

	//lister les fichiers INPUT
	let files  = dirRec(dir_input);
	let nb     = files.length;
	let compte = 0;


	if( callback == undefined )
		callback = function(data, ext, end){ end(data) };

	return new Promise(function( resolve, reject)
	{
		//parcour tout les fichiers
		for( var i=0; i<files.length; i++ )
		{
			let file = files[i];
			let options = undefined;
			if( isBinaryPath( file ) == false )
				options = 'utf8';

			//lire le fichier
			fs.readFile( file, options, function (err,data)
			{
			  
			  //si impossible a lire
			  if(err){
			  	reject( err, file );
			  	return;
			  }

			  //get extension
			  let ext = getExtFile(file);

			  //appelle de la fonction de vérification
			  let end = function( new_data )
			  {
			  	//get separation path racine, path app
			  	let p = file.split( dir_input );
			  	p = p[1];
			  	let new_file = dir_output+p;

			  	//verifier le path
			  	let dir = pathSepDirFile(new_file).dir;
			  	mkdirp( dir,function()
			  	{
				  	//ecriture du nouveau fichier
					fs.writeFile( new_file, new_data, function (err)
					{
					  if (err){
					  	reject( err, file );
					  	return;
					  }

					  //end
					  compte++;
					  if( compte == nb )
					  {
					  	resolve();
					  	return;
					  }
					  
					});
			  	});
			  };

			  if( options != undefined )
			  	callback( data, ext, end);
			  else
			  	end(data);
			  
			});
		}
	});
}