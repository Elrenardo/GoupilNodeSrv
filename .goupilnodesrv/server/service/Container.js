'use strict';
/*
===================================================================
* File name   : Container.js
* Author      : Teysseire Guillaume
* Create At   : 14/11/2016
* Update At   : 
* Description : Class du pattern design des conteneur pour le stockage d'objet
===================================================================
*/


module.exports = function( store )
{
	let storage = {};
	//si ces un stockage externe
	if( store != undefined )
		storage = store;

	/*
	|------------------------------------------------------------------------
	| Ajouter un element au storage
	|------------------------------------------------------------------------
	*/
	this.add = function( id, value )
	{
		if( !this.isset(id) )
		{
			storage[ id ] = value;
			return true;
		}
		return false;
	}



	/*
	|------------------------------------------------------------------------
	| renvoyer une valeur
	|------------------------------------------------------------------------
	*/
	this.get = function( id )
	{
		return storage[ id ];
	}


	/*
	|------------------------------------------------------------------------
	| Modifie une valeur ou la crée
	|------------------------------------------------------------------------
	*/
	this.set = function( id, value )
	{
		storage[ id ] = value;
	}



	/*
	|------------------------------------------------------------------------
	| Supprimer une valeur
	|------------------------------------------------------------------------
	*/
	this.remove = function( id )
	{
		delete storage[ id ];
	}



	/*
	|------------------------------------------------------------------------
	| Vérifie si une valeur existe
	|------------------------------------------------------------------------
	*/
	this.isset = function( id )
	{
		if( storage[ id ] )
			return true;
		return false;
	}


	/*
	|------------------------------------------------------------------------
	| Boucle sur les valeurs ( renvoyer un false pour arrêter)
	|------------------------------------------------------------------------
	*/
	this.forEach = function( callback )
	{
		for(var i in storage )
		{
			let rep = callback( i, storage[i] );

			if( rep != undefined )
			if( rep == false )
				return;
		}
	}


	/*
	|------------------------------------------------------------------------
	| Renvoi le nombre d'élement dans le contenaire
	|------------------------------------------------------------------------
	*/
	this.nb = function()
	{
		let compte = 0;
		for( var i in storage )
			compte++;
		return compte;
	}


	/*
	|------------------------------------------------------------------------
	| Renvoi la listes de tous les indices du storage
	|------------------------------------------------------------------------
	*/
	this.getAllIndex = function()
	{
		let tab = [];
		for( var i in storage )
			tab.push(i);
		return tab;
	}
}