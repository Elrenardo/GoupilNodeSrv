'use strict';
/*
===================================================================
* File name   : getExtFile.js
* Author      : Teysseire Guillaume
* Create At   : 12/08/2017
* Update At   : 
* Description : renvoi l'extension d'un fichier
===================================================================
*/
module.exports = function( file )
{
	let ext = file.split('.');
	return ext[ ext.length-1 ];
}