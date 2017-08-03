'use strict';
/*
===================================================================
* File name   : pathSepDirFile.js
* Author      : Teysseire Guillaume
* Create At   : 01/08/2016
* Update At   : 
* Description : sépare la partie DIR et FILE d'un path
===================================================================
*/
let separator = '/';

module.exports = function( url )
{
	let tab  = url.split( separator );
	let file = tab[ tab.length-1 ];
	tab.pop();
	let dir = tab.join( separator );

	return {'file':file,'dir':dir };
};