'use strict';
/*
===================================================================
* File name   : timestamp.js
* Author      : Teysseire Guillaume
* Create At   : 17/11/2016
* Update At   : 
* Description : gestion d'un timestamp
===================================================================
*/


module.exports = function()
{
	let ts = new Date().getTime();
	ts = (ts/1000) | 0;
	return ts;
};