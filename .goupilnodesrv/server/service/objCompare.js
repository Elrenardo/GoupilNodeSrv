'use strict';
/*
===================================================================
* File name   : objCompare.js
* Author      : Teysseire Guillaume
* Create At   : 10/09/2017
* Update At   : 
* Description : vérifie si deux object sont les memes
===================================================================
*/

module.exports = function( obj1, obj2 )
{
	//verif obj 1 == obj2
	for( var i in obj1 )
	{
		if( !obj2.hasOwnProperty(i) )
			return false;

		if( obj1[i] != obj2[i] )
			return false;
	}

	//verif obj2 == obj1
	for( var i in obj2 )
	{
		if(!obj1.hasOwnProperty(i) )
			return false;

		if( obj2[i] != obj1[i] )
			return false;
	}
	return true;
};