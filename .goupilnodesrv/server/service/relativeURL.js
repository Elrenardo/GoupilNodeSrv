'use strict';
/*
===================================================================
* File name   : relativeURL.js
* Author      : Teysseire Guillaume
* Create At   : 12/12/2016
* Update At   : 
* Description : remplace les ./ ou ../ par la vrais valeur URL
===================================================================
*/


module.exports = function( url )
{
	return cutslash( url, '/' );
};


function cutslash( url, cut )
{
	let tab = url.split( /[/,\\]+/ );
	return build( tab );
}


function build( tab )
{
	let ret = new Array();
	for( let i=0; i < tab.length; i++)
	{
		switch(tab[i])
		{
			case '..':
				ret.pop();
				break;
			case '.':
				break;
			default:
				ret.push( tab[i] );
				break;
		};
	}
	return ret.join('/');
}