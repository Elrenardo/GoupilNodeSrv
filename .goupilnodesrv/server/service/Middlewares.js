'use strict';
/*
===================================================================
* File name   : Middleware.js
* Author      : Teysseire Guillaume
* Create At   : 14/11/2016
* Update At   : 15/11/2016
* Description : Class du pattern design des Midllewares
===================================================================
*/


module.exports = function()
{
	let tab      = [];
	let i        = 0;
	let params   = {};
	let callback = function(){};


	/*
	|------------------------------------------------------------------------
	| PRIVATE: lancement de la boucle 
	|------------------------------------------------------------------------
	*/
	let next = function()
	{
		//modification de la boucle
		i--;

		//vérifier qu on et pas en fin de boucle
		if( tab[i] != undefined)
		{
			tab[i]( params, next);
		}
		else
		{
			i = tab.length;
			callback( params );
		}
	}



	/*
	|------------------------------------------------------------------------
	| Ajouter un nouvel éléments à la fin du Middlewares
	|------------------------------------------------------------------------
	*/
	this.use = function( fn )
	{
		tab.push(fn);
		return this;
	}


	/*
	|------------------------------------------------------------------------
	| Ajouter un nouvel éléments au debut du Middlewares
	|------------------------------------------------------------------------
	*/
	this.useStart = function( fn )
	{
		tab.unshift( fn );
	}


	/*
	|------------------------------------------------------------------------
	| Lancement du traitement du middleswares
	|------------------------------------------------------------------------
	*/
	this.run = function( data, _callback )
	{
		if( _callback != undefined )
			callback = _callback;
		
		if( data != undefined)
			params = data;
		
		i = tab.length;
		next();
	}


	/*
	|------------------------------------------------------------------------
	| definir le callback de finc
	|------------------------------------------------------------------------
	*/
	this.setCallback = function( _callback )
	{
		callback = _callback;
	}
}