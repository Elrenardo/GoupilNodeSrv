//'use strict'; /* NON COMPATIBLE !!*/
/*
===================================================================
* File name   : include.js
* Author      : Teysseire Guillaume
* Create At   : 28/11/2016
* Update At   : 
* Description : execute un fichier JS avec des paramettres en global
===================================================================
*/
let fs = require('graceful-fs');//require('fs');

//Fonction principal
module.exports = function( file, app )
{
	//coffre pour eviter de poluer le scope de variable
	let coffre = function( data )
	{
		for( var i in app )
		{
			let buffer = undefined;
			switch( typeof app[i])
			{
				case 'function':
				case 'object':
					buffer = 'var '+i+' = '+app[i];
					break;

				case 'boolean':
				case 'number':
				case 'string':
					buffer = 'var '+i+' = "'+app[i]+'";';
					break;
			}
			if( buffer != undefined )
				eval( buffer );
		}

		//compile du fichier
		eval( data );
	}


	try{
		let data = fs.readFileSync( file, "UTF-8");
	
		//execution du coffre
		coffre( data );

	}catch(err){//erreur gestion
		console.log('Err include file:'+file );
		console.log( err );
	}
}