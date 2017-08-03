'use strict';
/*
===================================================================
* File name   : AuthMain.js
* Author      : Teysseire Guillaume
* Create At   : 24/12/2016
* Update At   : 
* Description : class de gestion d'authorisation
===================================================================
*/

module.exports = function()
{
	let auth     = [];

	/* Ajouter une authorisation */
	this.addAuth = function( name )
	{
		auth.add( name );
	}

	/* supprimer une authorisation */
	this.removeAuth = function( name )
	{
		auth.remove( name );
	}

	/* verifie si un ctrl a l'authorisation pour utiliser ce ctrl*/
	this.verifAuth = function( tab_auth )
	{
		//verif la longueur
		if( auth.length < 1 )
			return true;

		for( var i in tab_auth )
		if( auth.indexOf( tab_auth[i]) !== -1)
			return true;
		return false;
	}
};

/*
===================================================================
=
=  Ajout de la fonction remove au array de ce fichier
=
===================================================================
*/
Array.prototype.remove = function( name )
{
	var index = this.indexOf( name );
	if (index > -1)
		   this.splice(index, 1);
}


/*
===================================================================
=
= Ajout de la fonction add au array de ce fichier,
= Elle permet un ajout unique dans un array 
=
===================================================================
*/
Array.prototype.add = function( name )
{
	var index = this.indexOf( name );
	if( index === -1 )
		this.push( name );
}