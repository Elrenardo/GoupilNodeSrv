'use strict';
/*
===================================================================
* File name   : end.js
* Author      : Teysseire Guillaume
* Create At   : 23/11/2016
* Update At   : 
* Description : MiddleWares d'affichage du lancement du server
===================================================================
*/

module.exports = function( params, next )
{

	/*
	===================================================================
	=
	=  Message de lancement du serveur
	=
	===================================================================
	*/
	let server = params.server;
	//debug('Server start://%s:%s => '+(new Date())+' --', server.address().address, server.address().port);

	/*
	===================================================================
	=
	=  MiddleWares suivant
	=
	===================================================================
	*/
	next();
}