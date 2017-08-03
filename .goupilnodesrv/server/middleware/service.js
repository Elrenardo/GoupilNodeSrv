'use strict';
/*
===================================================================
* File name   : session.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : MiddleWares de gestion des sessions utilisateur
===================================================================
*/

let path = global.dirname+global.config.path_service+'/';

const Container   = require( path+'Container.js');
const dirRec      = require( path+'dirRec.js');
const getNameFile = require( path+'getNameFile.js');

const path_service = 'server/service';

module.exports = function( params, next )
{
	let service = new Container();

	/*
	===================================================================
	=
	=  Recherches des fichiers service
	=
	===================================================================
	*/
	let files = dirRec( global.dirname+path_service, 'js');
	

	/*
	===================================================================
	=
	=  Chargement des services
	=
	===================================================================
	*/
	//ajout des services
	for(let i in files )
	{
		let path = files[i];
		let name = getNameFile( path );

		global.debug( 'Service add: '+name + ' => '+ path );
		service.add( name, require(path) );
	}


	/*
	===================================================================
	=
	=  Enregistement
	=
	===================================================================
	*/
	global.service = service;



	/*
	===================================================================
	=
	=  MiddleWares suivant
	=
	===================================================================
	*/
	next();
};