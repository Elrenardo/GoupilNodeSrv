'use strict';
/*
===================================================================
* File name   : empty.js
* Create At   : 07/12/2016
* Update At   : 
* Description : verifie si une variable et pas vide
===================================================================
*/

global.require = function(filename)
{
	return require( filename );
};

global.requireApp = function(filename)
{
	return require( global.config.path_app + filename );
};